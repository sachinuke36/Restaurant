import { Response } from "express";
import { db } from "../../db/drizzle";
import {
  deliveriesTable,
  ordersTable,
  usersTable,
  restaurantsTable,
  addresses,
  orderItemsTable,
  menuItemsTable,
  orderStatusHistory,
} from "../../db/schema";
import { AuthRequest } from "../../../types/express";
import { eq, and, desc, isNull, sql, gte } from "drizzle-orm";

// ==========================================
// GET AVAILABLE ORDERS (status = 'ready', no delivery assigned)
// ==========================================
export const getAvailableOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Get orders that are 'ready' and don't have a delivery record yet
    const orders = await db
      .select({
        id: ordersTable.id,
        status: ordersTable.status,
        total_amount: ordersTable.total_amount,
        delivery_fee: ordersTable.delivery_fee,
        created_at: ordersTable.created_at,
        restaurant_id: ordersTable.restaurant_id,
        restaurant_name: restaurantsTable.name,
        restaurant_address: restaurantsTable.address,
        restaurant_image: restaurantsTable.image_url,
        restaurant_phone: restaurantsTable.phone,
        customer_name: usersTable.name,
        customer_phone: usersTable.phone,
        delivery_address_line1: addresses.addressLine1,
        delivery_address_line2: addresses.addressLine2,
        delivery_city: addresses.city,
        delivery_state: addresses.state,
        delivery_postal_code: addresses.postalCode,
      })
      .from(ordersTable)
      .leftJoin(restaurantsTable, eq(ordersTable.restaurant_id, restaurantsTable.id))
      .leftJoin(usersTable, eq(ordersTable.customer_id, usersTable.id))
      .leftJoin(addresses, eq(ordersTable.address_id, addresses.id))
      .leftJoin(deliveriesTable, eq(ordersTable.id, deliveriesTable.order_id))
      .where(
        and(
          eq(ordersTable.status, "ready"),
          isNull(deliveriesTable.id)
        )
      )
      .orderBy(desc(ordersTable.created_at));

    return res.json({ orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ==========================================
// PICK ORDER (Self-assignment)
// ==========================================
export const pickOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const orderId = Number(req.params.orderId);

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Check if order exists and is ready
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId));

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "ready") {
      return res.status(400).json({ message: "Order is not ready for pickup" });
    }

    // Check if already assigned
    const [existingDelivery] = await db
      .select()
      .from(deliveriesTable)
      .where(eq(deliveriesTable.order_id, orderId));

    if (existingDelivery) {
      return res.status(400).json({ message: "Order already assigned to a delivery person" });
    }

    // Create delivery record
    const [delivery] = await db
      .insert(deliveriesTable)
      .values({
        order_id: orderId,
        delivery_person_id: userId,
        status: "assigned",
      })
      .returning();

    return res.status(201).json({
      message: "Order assigned successfully",
      delivery,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ==========================================
// GET MY DELIVERIES
// ==========================================
export const getMyDeliveries = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status } = req.query; // Optional filter: 'active' | 'completed' | 'all'

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const deliveries = await db
      .select({
        id: deliveriesTable.id,
        order_id: deliveriesTable.order_id,
        status: deliveriesTable.status,
        picked_at: deliveriesTable.picked_at,
        delivered_at: deliveriesTable.delivered_at,
        created_at: deliveriesTable.created_at,
        order_status: ordersTable.status,
        order_total: ordersTable.total_amount,
        delivery_fee: ordersTable.delivery_fee,
        order_created: ordersTable.created_at,
        restaurant_name: restaurantsTable.name,
        restaurant_address: restaurantsTable.address,
        restaurant_image: restaurantsTable.image_url,
        restaurant_phone: restaurantsTable.phone,
        customer_name: usersTable.name,
        customer_phone: usersTable.phone,
        delivery_address_line1: addresses.addressLine1,
        delivery_address_line2: addresses.addressLine2,
        delivery_city: addresses.city,
        delivery_postal_code: addresses.postalCode,
      })
      .from(deliveriesTable)
      .leftJoin(ordersTable, eq(deliveriesTable.order_id, ordersTable.id))
      .leftJoin(restaurantsTable, eq(ordersTable.restaurant_id, restaurantsTable.id))
      .leftJoin(usersTable, eq(ordersTable.customer_id, usersTable.id))
      .leftJoin(addresses, eq(ordersTable.address_id, addresses.id))
      .where(eq(deliveriesTable.delivery_person_id, userId))
      .orderBy(desc(deliveriesTable.created_at));

    // Filter based on status query
    let filteredDeliveries = deliveries;
    if (status === 'active') {
      filteredDeliveries = deliveries.filter(d =>
        d.status === 'assigned' || d.status === 'picked_up'
      );
    } else if (status === 'completed') {
      filteredDeliveries = deliveries.filter(d =>
        d.status === 'delivered' || d.status === 'cancelled'
      );
    }

    return res.json({ deliveries: filteredDeliveries });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ==========================================
// GET DELIVERY DETAILS
// ==========================================
export const getDeliveryDetails = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const deliveryId = Number(req.params.id);

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const [delivery] = await db
      .select({
        id: deliveriesTable.id,
        order_id: deliveriesTable.order_id,
        status: deliveriesTable.status,
        picked_at: deliveriesTable.picked_at,
        delivered_at: deliveriesTable.delivered_at,
        created_at: deliveriesTable.created_at,
        order_status: ordersTable.status,
        order_total: ordersTable.total_amount,
        order_subtotal: ordersTable.subtotal,
        order_delivery_fee: ordersTable.delivery_fee,
        order_tax: ordersTable.tax,
        order_created: ordersTable.created_at,
        restaurant_id: restaurantsTable.id,
        restaurant_name: restaurantsTable.name,
        restaurant_address: restaurantsTable.address,
        restaurant_image: restaurantsTable.image_url,
        restaurant_phone: restaurantsTable.phone,
        restaurant_latitude: restaurantsTable.latitude,
        restaurant_longitude: restaurantsTable.longitude,
        customer_id: usersTable.id,
        customer_name: usersTable.name,
        customer_phone: usersTable.phone,
        delivery_address_id: addresses.id,
        delivery_full_name: addresses.fullName,
        delivery_phone: addresses.phone,
        delivery_address_line1: addresses.addressLine1,
        delivery_address_line2: addresses.addressLine2,
        delivery_city: addresses.city,
        delivery_state: addresses.state,
        delivery_postal_code: addresses.postalCode,
        delivery_latitude: addresses.latitude,
        delivery_longitude: addresses.longitude,
      })
      .from(deliveriesTable)
      .leftJoin(ordersTable, eq(deliveriesTable.order_id, ordersTable.id))
      .leftJoin(restaurantsTable, eq(ordersTable.restaurant_id, restaurantsTable.id))
      .leftJoin(usersTable, eq(ordersTable.customer_id, usersTable.id))
      .leftJoin(addresses, eq(ordersTable.address_id, addresses.id))
      .where(
        and(
          eq(deliveriesTable.id, deliveryId),
          eq(deliveriesTable.delivery_person_id, userId)
        )
      );

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    // Get order items
    const items = await db
      .select({
        id: orderItemsTable.id,
        quantity: orderItemsTable.quantity,
        price: orderItemsTable.price,
        name: menuItemsTable.name,
      })
      .from(orderItemsTable)
      .leftJoin(menuItemsTable, eq(orderItemsTable.menu_item_id, menuItemsTable.id))
      .where(eq(orderItemsTable.order_id, delivery.order_id));

    return res.json({ delivery, items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ==========================================
// UPDATE DELIVERY STATUS
// ==========================================
export const updateDeliveryStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const deliveryId = Number(req.params.id);
    const { status } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (!['picked_up', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Check ownership
    const [delivery] = await db
      .select()
      .from(deliveriesTable)
      .where(
        and(
          eq(deliveriesTable.id, deliveryId),
          eq(deliveriesTable.delivery_person_id, userId)
        )
      );

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    // Update delivery status
    const updateData: any = {
      status,
      updated_at: new Date(),
    };

    if (status === 'picked_up') {
      updateData.picked_at = new Date();
    } else if (status === 'delivered') {
      updateData.delivered_at = new Date();
    }

    const [updatedDelivery] = await db
      .update(deliveriesTable)
      .set(updateData)
      .where(eq(deliveriesTable.id, deliveryId))
      .returning();

    // Also update order status
    let orderStatus: "out_for_delivery" | "delivered" | "ready" = "ready";
    if (status === 'picked_up') {
      orderStatus = 'out_for_delivery';
    } else if (status === 'delivered') {
      orderStatus = 'delivered';
    } else if (status === 'cancelled') {
      orderStatus = 'ready'; // Return to ready so another driver can pick
    }

    await db
      .update(ordersTable)
      .set({
        status: orderStatus,
        updated_at: new Date(),
      })
      .where(eq(ordersTable.id, delivery.order_id));

    // Add to order status history
    await db.insert(orderStatusHistory).values({
      order_id: delivery.order_id,
      status: orderStatus,
    });

    return res.json({
      message: "Delivery status updated",
      delivery: updatedDelivery,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ==========================================
// GET EARNINGS
// ==========================================
export const getEarnings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { period } = req.query; // 'today' | 'week' | 'month' | 'all'

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let dateFilter;
    const now = new Date();

    if (period === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = gte(deliveriesTable.delivered_at, startOfDay);
    } else if (period === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);
      dateFilter = gte(deliveriesTable.delivered_at, startOfWeek);
    } else if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = gte(deliveriesTable.delivered_at, startOfMonth);
    }

    // Get completed deliveries
    const completedDeliveries = await db
      .select({
        id: deliveriesTable.id,
        delivered_at: deliveriesTable.delivered_at,
        delivery_fee: ordersTable.delivery_fee,
      })
      .from(deliveriesTable)
      .leftJoin(ordersTable, eq(deliveriesTable.order_id, ordersTable.id))
      .where(
        and(
          eq(deliveriesTable.delivery_person_id, userId),
          eq(deliveriesTable.status, 'delivered'),
          dateFilter ? dateFilter : sql`1=1`
        )
      );

    const totalEarnings = completedDeliveries.reduce(
      (sum, d) => sum + Number(d.delivery_fee || 0),
      0
    );

    const totalDeliveries = completedDeliveries.length;

    // Get daily breakdown for the period
    const dailyBreakdown = await db
      .select({
        date: sql<string>`DATE(${deliveriesTable.delivered_at})`.as('date'),
        count: sql<number>`COUNT(*)::int`.as('count'),
        earnings: sql<number>`COALESCE(SUM(${ordersTable.delivery_fee}), 0)::numeric`.as('earnings'),
      })
      .from(deliveriesTable)
      .leftJoin(ordersTable, eq(deliveriesTable.order_id, ordersTable.id))
      .where(
        and(
          eq(deliveriesTable.delivery_person_id, userId),
          eq(deliveriesTable.status, 'delivered'),
          dateFilter ? dateFilter : sql`1=1`
        )
      )
      .groupBy(sql`DATE(${deliveriesTable.delivered_at})`)
      .orderBy(desc(sql`DATE(${deliveriesTable.delivered_at})`));

    return res.json({
      totalEarnings,
      totalDeliveries,
      dailyBreakdown,
      period: period || 'all',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ==========================================
// GET DELIVERY HISTORY
// ==========================================
export const getDeliveryHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const offset = (Number(page) - 1) * Number(limit);

    const deliveries = await db
      .select({
        id: deliveriesTable.id,
        order_id: deliveriesTable.order_id,
        status: deliveriesTable.status,
        delivered_at: deliveriesTable.delivered_at,
        created_at: deliveriesTable.created_at,
        order_total: ordersTable.total_amount,
        delivery_fee: ordersTable.delivery_fee,
        restaurant_name: restaurantsTable.name,
        customer_name: usersTable.name,
        delivery_city: addresses.city,
      })
      .from(deliveriesTable)
      .leftJoin(ordersTable, eq(deliveriesTable.order_id, ordersTable.id))
      .leftJoin(restaurantsTable, eq(ordersTable.restaurant_id, restaurantsTable.id))
      .leftJoin(usersTable, eq(ordersTable.customer_id, usersTable.id))
      .leftJoin(addresses, eq(ordersTable.address_id, addresses.id))
      .where(
        and(
          eq(deliveriesTable.delivery_person_id, userId),
          eq(deliveriesTable.status, 'delivered')
        )
      )
      .orderBy(desc(deliveriesTable.delivered_at))
      .limit(Number(limit))
      .offset(offset);

    return res.json({ deliveries, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
