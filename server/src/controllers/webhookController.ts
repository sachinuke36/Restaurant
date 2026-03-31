import { Request, Response } from "express";
import Stripe from "stripe";
import { db } from "../db/drizzle";
import {
  cartItemsTable,
  cartTable,
  menuItemsTable,
  orderItemsTable,
  ordersTable,
  orderStatusHistory,
  paymentsTable,
} from "../db/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const metadata = paymentIntent.metadata;

  const userId = parseInt(metadata.user_id);
  const cartId = parseInt(metadata.cart_id);
  const addressId = parseInt(metadata.address_id);
  const restaurantId = parseInt(metadata.restaurant_id);
  const subtotal = parseFloat(metadata.subtotal);
  const deliveryFee = parseFloat(metadata.delivery_fee);
  const tax = parseFloat(metadata.tax);
  const totalAmount = parseFloat(metadata.total_amount);

  if (!userId || !cartId || !addressId || !restaurantId) {
    console.error("Missing metadata in payment intent:", metadata);
    return;
  }

  try {
    await db.transaction(async (trx) => {
      // Check if order already exists for this payment intent (idempotency)
      const existingOrders = await trx
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.payment_intent_id, paymentIntent.id));

      if (existingOrders.length > 0) {
        console.log("Order already exists for payment intent:", paymentIntent.id);
        return;
      }

      // Get cart items
      const cartItems = await trx
        .select({
          menu_item_id: cartItemsTable.menu_item_id,
          quantity: cartItemsTable.quantity,
          price: menuItemsTable.price,
        })
        .from(cartItemsTable)
        .leftJoin(menuItemsTable, eq(cartItemsTable.menu_item_id, menuItemsTable.id))
        .where(eq(cartItemsTable.cart_id, cartId));

      if (cartItems.length === 0) {
        console.error("Cart is empty for payment intent:", paymentIntent.id);
        return;
      }

      // Create order
      const [order] = await trx
        .insert(ordersTable)
        .values({
          customer_id: userId,
          restaurant_id: restaurantId,
          address_id: addressId,
          subtotal: subtotal.toString(),
          delivery_fee: deliveryFee.toString(),
          tax: tax.toString(),
          discount: "0",
          total_amount: totalAmount.toString(),
          status: "confirmed",
          payment_intent_id: paymentIntent.id,
          payment_method: "card",
        })
        .returning();

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: Number(item.price).toString(),
        total_price: (Number(item.price) * item.quantity).toString(),
      }));

      await trx.insert(orderItemsTable).values(orderItems);

      // Create order status history
      await trx.insert(orderStatusHistory).values({
        order_id: order.id,
        status: "confirmed",
      });

      // Create payment record
      await trx.insert(paymentsTable).values({
        order_id: order.id,
        amount: totalAmount.toString(),
        status: "completed",
        payment_provider_id: paymentIntent.id,
        transaction_id: paymentIntent.latest_charge as string || paymentIntent.id,
        payment_method: "card",
      });

      // Clear cart
      await trx.delete(cartItemsTable).where(eq(cartItemsTable.cart_id, cartId));
      await trx.delete(cartTable).where(eq(cartTable.id, cartId));

      console.log("Order created successfully:", order.id);
    });
  } catch (error) {
    console.error("Error creating order from webhook:", error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment failed for intent:", paymentIntent.id);
  // Optionally log failed payment attempts or notify user
}
