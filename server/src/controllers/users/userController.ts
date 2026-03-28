import { Request, Response } from "express";
import * as userService from "../../services/userServices";
import { db } from "../../db/drizzle";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
import {
  addresses as addressTable,
  cartItemsTable,
  cartTable,
  menuItemsTable,
  orderItemsTable,
  ordersTable,
  orderStatusHistory,
  restaurantsTable,
  usersTable,
} from "../../db/schema";
import { and, eq } from "drizzle-orm";
import bcryptjs from "bcrypt";
import { AuthRequest } from "../../../types/express";



//-----------------------------------------------------------------------------------------------
//------------------------------------ USER INFO -------------------------------------------------
//------------------------------------------------------------------------------------------------

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const isExistingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (isExistingUser.length > 0) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const hashedPassword =
      await userService.generateHashedPasswordWithSalt(password);

    const user: typeof usersTable.$inferInsert = {
      name,
      email,
      password: hashedPassword,
      phone: phone,
      role: "customer",
    };

    const data = await db.insert(usersTable).values(user).returning();
    const userdata = data[0];
    const { password: _, ...safeUser } = userdata;

    const token = userService.generateToken(safeUser);
    return res.status(201).json({ ...safeUser, token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  console.log(req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required !" });

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (!user.length)
      return res.status(404).json({
        message: "No user found with this email. Please create an account !",
      });
    const userData = user[0];
    const isPassCorrect = await bcryptjs.compare(password, userData.password);

    if (!isPassCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    const { password: _, ...safeUser } = userData;

    const token = userService.generateToken(safeUser);
    return res
      .status(200)
      .json({ message: "Login successfull !", ...safeUser, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const fetchAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const address = await db
      .select()
      .from(addressTable)
      .where(eq(addressTable.userId, userId));

    return res.status(200).json({
      address,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const addAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // If this is set as default, unset other defaults first
    if (isDefault) {
      await db
        .update(addressTable)
        .set({ isDefault: false })
        .where(eq(addressTable.userId, userId));
    }

    const [address] = await db
      .insert(addressTable)
      .values({
        userId,
        fullName,
        phone,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        state,
        postalCode,
        country: country || "India",
        isDefault: isDefault || false,
      })
      .returning();

    return res.status(201).json({
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const addressId = Number(req.params.id);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    // Check if address belongs to user
    const [existing] = await db
      .select()
      .from(addressTable)
      .where(and(eq(addressTable.id, addressId), eq(addressTable.userId, userId)));

    if (!existing) {
      return res.status(404).json({ message: "Address not found" });
    }

    // If setting as default, unset other defaults first
    if (isDefault) {
      await db
        .update(addressTable)
        .set({ isDefault: false })
        .where(eq(addressTable.userId, userId));
    }

    const [address] = await db
      .update(addressTable)
      .set({
        fullName: fullName || existing.fullName,
        phone: phone || existing.phone,
        addressLine1: addressLine1 || existing.addressLine1,
        addressLine2: addressLine2 !== undefined ? addressLine2 : existing.addressLine2,
        city: city || existing.city,
        state: state || existing.state,
        postalCode: postalCode || existing.postalCode,
        country: country || existing.country,
        isDefault: isDefault !== undefined ? isDefault : existing.isDefault,
        updatedAt: new Date(),
      })
      .where(eq(addressTable.id, addressId))
      .returning();

    return res.json({
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const addressId = Number(req.params.id);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Check if address belongs to user
    const [existing] = await db
      .select()
      .from(addressTable)
      .where(and(eq(addressTable.id, addressId), eq(addressTable.userId, userId)));

    if (!existing) {
      return res.status(404).json({ message: "Address not found" });
    }

    await db.delete(addressTable).where(eq(addressTable.id, addressId));

    return res.json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const setDefaultAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const addressId = Number(req.params.id);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Check if address belongs to user
    const [existing] = await db
      .select()
      .from(addressTable)
      .where(and(eq(addressTable.id, addressId), eq(addressTable.userId, userId)));

    if (!existing) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Unset all defaults
    await db
      .update(addressTable)
      .set({ isDefault: false })
      .where(eq(addressTable.userId, userId));

    // Set this one as default
    const [address] = await db
      .update(addressTable)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(eq(addressTable.id, addressId))
      .returning();

    return res.json({
      message: "Default address updated",
      address,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const usersInfo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password: _, ...safeUser } = user[0];

    return res.status(200).json({ user: safeUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


//-----------------------------------------------------------------------------------------------
//------------------------ CART -----------------------------------------------------------------
//------------------------------------------------------------------------------------------------

// Helper function to get full cart details
const getFullCartDetails = async (userId: number) => {
  const [cart] = await db
    .select()
    .from(cartTable)
    .where(eq(cartTable.customer_id, userId));

  if (!cart) return null;

  // Get restaurant info
  const [restaurant] = await db
    .select({
      id: restaurantsTable.id,
      name: restaurantsTable.name,
      image_url: restaurantsTable.image_url,
    })
    .from(restaurantsTable)
    .where(eq(restaurantsTable.id, cart.restaurant_id));

  // Get cart items with menu info
  const cartItems = await db
    .select({
      id: cartItemsTable.id,
      cart_id: cartItemsTable.cart_id,
      menu_item_id: cartItemsTable.menu_item_id,
      quantity: cartItemsTable.quantity,
      name: menuItemsTable.name,
      price: menuItemsTable.price,
      image: menuItemsTable.img_url,
    })
    .from(cartItemsTable)
    .leftJoin(menuItemsTable, eq(cartItemsTable.menu_item_id, menuItemsTable.id))
    .where(eq(cartItemsTable.cart_id, cart.id));

  let total = 0;
  const items = cartItems.map((item) => {
    const itemTotal = item.quantity * Number(item.price);
    total += itemTotal;
    return {
      id: item.id,
      cart_id: item.cart_id,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      price: Number(item.price),
      name: item.name,
      image: item.image,
    };
  });

  return {
    id: cart.id,
    user_id: cart.customer_id,
    restaurant_id: cart.restaurant_id,
    restaurant_name: restaurant?.name || "",
    restaurant_image: restaurant?.image_url || "",
    items,
    total,
  };
};

export const addItemToCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { menu_item_id, restaurant_id, quantity } = req.body;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    if (!menu_item_id || !restaurant_id || !quantity) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    // find cart
    let [cart] = await db
      .select()
      .from(cartTable)
      .where(eq(cartTable.customer_id, userId));

    // If cart exists but from different restaurant, clear it
    if (cart && cart.restaurant_id !== restaurant_id) {
      await db.delete(cartItemsTable).where(eq(cartItemsTable.cart_id, cart.id));
      await db.delete(cartTable).where(eq(cartTable.id, cart.id));
      cart = undefined as any;
    }

    // create cart if not exists
    if (!cart) {
      [cart] = await db
        .insert(cartTable)
        .values({
          customer_id: userId,
          restaurant_id,
        })
        .returning();
    }

    // check if item already exists
    const [existingItem] = await db
      .select()
      .from(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.cart_id, cart.id),
          eq(cartItemsTable.menu_item_id, menu_item_id)
        )
      );

    if (existingItem) {
      // update quantity
      await db
        .update(cartItemsTable)
        .set({
          quantity: existingItem.quantity + quantity,
          updated_at: new Date(),
        })
        .where(eq(cartItemsTable.id, existingItem.id));
    } else {
      // insert new item
      await db
        .insert(cartItemsTable)
        .values({
          cart_id: cart.id,
          menu_item_id,
          quantity,
        });
    }

    // Return full cart details
    const fullCart = await getFullCartDetails(userId);

    return res.status(200).json({
      message: "Item added to cart",
      cart: fullCart,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeItemFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { menu_item_id, quantity } = req.body;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    if (!menu_item_id || !quantity) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    // find user cart
    const [cart] = await db
      .select()
      .from(cartTable)
      .where(eq(cartTable.customer_id, userId));

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    // find item
    const [cartItem] = await db
      .select()
      .from(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.cart_id, cart.id),
          eq(cartItemsTable.menu_item_id, menu_item_id)
        )
      );

    if (!cartItem) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    const newQuantity = cartItem.quantity - quantity;

    // delete if quantity <= 0
    if (newQuantity <= 0) {
      await db
        .delete(cartItemsTable)
        .where(eq(cartItemsTable.id, cartItem.id));

      // Check if cart is now empty
      const remainingItems = await db
        .select()
        .from(cartItemsTable)
        .where(eq(cartItemsTable.cart_id, cart.id));

      if (remainingItems.length === 0) {
        // Delete the cart if empty
        await db.delete(cartTable).where(eq(cartTable.id, cart.id));
        return res.json({
          message: "Cart is now empty",
          cart: null,
        });
      }
    } else {
      // update quantity
      await db
        .update(cartItemsTable)
        .set({
          quantity: newQuantity,
          updated_at: new Date(),
        })
        .where(eq(cartItemsTable.id, cartItem.id));
    }

    // Return full cart details
    const fullCart = await getFullCartDetails(userId);

    return res.json({
      message: "Cart updated",
      cart: fullCart,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCart = async(req: AuthRequest, res: Response)=>{
  try {
    const userId = req.user?.id
    if(!userId) return res.status(401).json({message: "Unauthorized !"});

    const fullCart = await getFullCartDetails(userId);

    if(!fullCart) {
      return res.status(200).json({
        message: "Your cart is empty",
        cart: null
      });
    }

    return res.status(200).json({
      message: "Cart Details!",
      cart: fullCart
    });

  } catch (error) {
     console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    const [cart] = await db
      .select()
      .from(cartTable)
      .where(eq(cartTable.customer_id, userId));

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    // delete items
    await db
      .delete(cartItemsTable)
      .where(eq(cartItemsTable.cart_id, cart.id));

    // delete cart
    await db
      .delete(cartTable)
      .where(eq(cartTable.id, cart.id));

    return res.json({
      message: "Cart cleared successfully",
      cart: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateCartItemQuantity = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { menu_item_id, quantity } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    if (!menu_item_id || quantity === undefined) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const [cart] = await db
      .select()
      .from(cartTable)
      .where(eq(cartTable.customer_id, userId));

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (quantity <= 0) {
      await db
        .delete(cartItemsTable)
        .where(
          and(
            eq(cartItemsTable.cart_id, cart.id),
            eq(cartItemsTable.menu_item_id, menu_item_id)
          )
        );

      // Check if cart is now empty
      const remainingItems = await db
        .select()
        .from(cartItemsTable)
        .where(eq(cartItemsTable.cart_id, cart.id));

      if (remainingItems.length === 0) {
        await db.delete(cartTable).where(eq(cartTable.id, cart.id));
        return res.json({
          message: "Cart is now empty",
          cart: null,
        });
      }
    } else {
      await db
        .update(cartItemsTable)
        .set({
          quantity,
          updated_at: new Date(),
        })
        .where(
          and(
            eq(cartItemsTable.cart_id, cart.id),
            eq(cartItemsTable.menu_item_id, menu_item_id)
          )
        );
    }

    const fullCart = await getFullCartDetails(userId);

    return res.json({
      message: "Quantity updated",
      cart: fullCart,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//-------------------------------------------------------------------------------------------------------------
//------------------------------------ ORDERING ---------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------

export const placeOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { address_id } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const order = await db.transaction(async (trx) => {

      const [cart] = await trx
        .select()
        .from(cartTable)
        .where(eq(cartTable.customer_id, userId));

      if (!cart) throw new Error("Cart not found");

      const cartItems = await trx
        .select({
          menu_item_id: cartItemsTable.menu_item_id,
          quantity: cartItemsTable.quantity,
          price: menuItemsTable.price
        })
        .from(cartItemsTable)
        .leftJoin(
          menuItemsTable,
          eq(cartItemsTable.menu_item_id, menuItemsTable.id)
        )
        .where(eq(cartItemsTable.cart_id, cart.id));

      if (cartItems.length === 0) {
        throw new Error("Cart is empty");
      }

      let subtotal = 0;

      for (const item of cartItems) {
        subtotal += Number(item.price) * item.quantity;
      }

      const deliveryFee = 40;
      const tax = Math.round(subtotal * 0.05);
      const discount = 0;

      const total = subtotal + deliveryFee + tax - discount;

      const [order] = await trx
        .insert(ordersTable)
        .values({
          customer_id: userId,
          restaurant_id: cart.restaurant_id,
          address_id,
          subtotal: subtotal.toString(),
          delivery_fee: deliveryFee.toString(),
          tax: tax.toString(),
          discount: discount.toString(),
          total_amount: total.toString(),
          status: "pending"
        })
        .returning();

      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: Number(item.price).toString(),
        total_price: (Number(item.price) * item.quantity).toString()
      }));

      await trx.insert(orderItemsTable).values(orderItems);

      await trx.insert(orderStatusHistory).values({
        order_id: order.id,
        status: "pending"
      });

      await trx.delete(cartItemsTable).where(eq(cartItemsTable.cart_id, cart.id));
      await trx.delete(cartTable).where(eq(cartTable.id, cart.id));

      return order;
    });

    return res.status(201).json({
      message: "Order placed successfully",
      order
    });

  } catch (error: any) {
    return res.status(400).json({
      message: error.message
    });
  }
};



export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const orders = await db
      .select({
        id: ordersTable.id,
        status: ordersTable.status,
        total_amount: ordersTable.total_amount,
        created_at: ordersTable.created_at,
        restaurant_id: ordersTable.restaurant_id,
        restaurant_name: restaurantsTable.name,
        restaurant_image: restaurantsTable.image_url,
      })
      .from(ordersTable)
      .leftJoin(restaurantsTable, eq(ordersTable.restaurant_id, restaurantsTable.id))
      .where(eq(ordersTable.customer_id, userId))
      .orderBy(ordersTable.created_at);

    return res.json({ orders });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const getOrderDetails = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const orderId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    // Get order with restaurant info
    const [orderData] = await db
      .select({
        id: ordersTable.id,
        status: ordersTable.status,
        total_amount: ordersTable.total_amount,
        subtotal: ordersTable.subtotal,
        delivery_fee: ordersTable.delivery_fee,
        tax: ordersTable.tax,
        discount: ordersTable.discount,
        created_at: ordersTable.created_at,
        customer_id: ordersTable.customer_id,
        restaurant_id: ordersTable.restaurant_id,
        restaurant_name: restaurantsTable.name,
        restaurant_image: restaurantsTable.image_url,
        restaurant_address: restaurantsTable.address,
      })
      .from(ordersTable)
      .leftJoin(restaurantsTable, eq(ordersTable.restaurant_id, restaurantsTable.id))
      .where(eq(ordersTable.id, orderId));

    if (!orderData || orderData.customer_id !== userId) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    // Get order items with menu item info
    const items = await db
      .select({
        id: orderItemsTable.id,
        quantity: orderItemsTable.quantity,
        price: orderItemsTable.price,
        total_price: orderItemsTable.total_price,
        menu_item_id: orderItemsTable.menu_item_id,
        name: menuItemsTable.name,
        image: menuItemsTable.img_url,
      })
      .from(orderItemsTable)
      .leftJoin(menuItemsTable, eq(orderItemsTable.menu_item_id, menuItemsTable.id))
      .where(eq(orderItemsTable.order_id, orderId));

    // Get status history
    const history = await db
      .select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.order_id, orderId))
      .orderBy(orderStatusHistory.created_at);

    // Get delivery address
    const [address] = await db
      .select()
      .from(addressTable)
      .where(eq(addressTable.id, orderData.id));

    return res.json({
      order: orderData,
      items,
      history,
      address
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};



export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {

    const userId = req.user?.id;
    const orderId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId));

    if (!order || order.customer_id !== userId) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (order.status === "delivered") {
      return res.status(400).json({
        message: "Delivered orders cannot be cancelled"
      });
    }

    await db.transaction(async (trx) => {

      await trx
        .update(ordersTable)
        .set({
          status: "cancelled",
          updated_at: new Date()
        })
        .where(eq(ordersTable.id, orderId));

      await trx.insert(orderStatusHistory).values({
        order_id: orderId,
        status: "cancelled"
      });

    });

    return res.json({
      message: "Order cancelled"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};


//-------------------------------------------------------------------------------------------------------------
//------------------------------------ PAYMENTS ---------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------

export const createPaymentIntent = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    // Get user's cart to calculate amount
    const [cart] = await db
      .select()
      .from(cartTable)
      .where(eq(cartTable.customer_id, userId));

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cartItems = await db
      .select({
        quantity: cartItemsTable.quantity,
        price: menuItemsTable.price,
      })
      .from(cartItemsTable)
      .leftJoin(menuItemsTable, eq(cartItemsTable.menu_item_id, menuItemsTable.id))
      .where(eq(cartItemsTable.cart_id, cart.id));

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let subtotal = 0;
    for (const item of cartItems) {
      subtotal += Number(item.price) * item.quantity;
    }

    const deliveryFee = 40;
    const tax = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + deliveryFee + tax;

    // Create payment intent (amount in paise for INR)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "inr",
      metadata: {
        user_id: userId.toString(),
        cart_id: cart.id.toString(),
      },
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount,
    });

  } catch (error: any) {
    console.error("Payment intent error:", error);
    return res.status(500).json({
      message: error.message || "Failed to create payment intent"
    });
  }
};