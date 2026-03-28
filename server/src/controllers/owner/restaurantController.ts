import { Response } from "express";
import { db } from "../../db/drizzle";
import {
  menuItemCategoriesTable,
  menuItemsTable,
  restaurantsTable,
  ordersTable,
  usersTable,
  categoriesTable,
} from "../../db/schema";
import { uploadToCloudinary } from "../../services/cloudinary.service";
import { AuthRequest } from "../../../types/express";
import { eq, and, desc } from "drizzle-orm";

// Helper function to verify restaurant ownership
const verifyRestaurantOwnership = async (userId: number, restaurantId: number) => {
  const [restaurant] = await db
    .select()
    .from(restaurantsTable)
    .where(
      and(
        eq(restaurantsTable.id, restaurantId),
        eq(restaurantsTable.owner_id, userId)
      )
    );
  return restaurant;
};

// Get all owner's restaurants
export const getMyRestaurants = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const restaurants = await db
      .select()
      .from(restaurantsTable)
      .where(eq(restaurantsTable.owner_id, userId));

    return res.json({ restaurants });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get specific restaurant by ID (must belong to owner)
export const getRestaurant = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const restaurantId = Number(req.params.restaurantId);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const restaurant = await verifyRestaurantOwnership(userId, restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    return res.json({ restaurant });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all menu items for a restaurant
export const getMenuItems = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const restaurantId = Number(req.params.restaurantId);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const restaurant = await verifyRestaurantOwnership(userId, restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const menuItems = await db
      .select({
        id: menuItemsTable.id,
        name: menuItemsTable.name,
        description: menuItemsTable.description,
        price: menuItemsTable.price,
        img_url: menuItemsTable.img_url,
        is_available: menuItemsTable.is_available,
        category_id: menuItemCategoriesTable.category_id,
        category_name: categoriesTable.name,
      })
      .from(menuItemsTable)
      .leftJoin(
        menuItemCategoriesTable,
        eq(menuItemsTable.id, menuItemCategoriesTable.menu_item_id)
      )
      .leftJoin(
        categoriesTable,
        eq(menuItemCategoriesTable.category_id, categoriesTable.id)
      )
      .where(eq(menuItemsTable.restaurant_id, restaurantId));

    return res.json({ menuItems });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Add menu item
export const addMenuItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const restaurantId = Number(req.params.restaurantId);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { name, description, price, category_id } = req.body;

    if (!name || !price || !category_id) {
      return res.status(400).json({ message: "Name, price and category are required" });
    }

    const restaurant = await verifyRestaurantOwnership(userId, restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    let imageUrl = null;
    if (req.file) {
      const result: any = await uploadToCloudinary(req.file.buffer, "menu-items");
      imageUrl = result.secure_url;
    }

    const [menuItem] = await db
      .insert(menuItemsTable)
      .values({
        restaurant_id: restaurantId,
        name,
        description: description || null,
        price,
        img_url: imageUrl,
      })
      .returning();

    await db.insert(menuItemCategoriesTable).values({
      menu_item_id: menuItem.id,
      category_id: Number(category_id),
    });

    return res.status(201).json({
      message: "Menu item added successfully",
      menuItem,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to add menu item" });
  }
};

// Update menu item
export const updateMenuItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const restaurantId = Number(req.params.restaurantId);
    const menuItemId = Number(req.params.id);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { name, description, price, is_available, category_id } = req.body;

    const restaurant = await verifyRestaurantOwnership(userId, restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const [existing] = await db
      .select()
      .from(menuItemsTable)
      .where(
        and(
          eq(menuItemsTable.id, menuItemId),
          eq(menuItemsTable.restaurant_id, restaurantId)
        )
      );

    if (!existing) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    let imageUrl = existing.img_url;
    if (req.file) {
      const result: any = await uploadToCloudinary(req.file.buffer, "menu-items");
      imageUrl = result.secure_url;
    }

    const [menuItem] = await db
      .update(menuItemsTable)
      .set({
        name: name || existing.name,
        description: description !== undefined ? description : existing.description,
        price: price || existing.price,
        img_url: imageUrl,
        is_available: is_available !== undefined ? is_available : existing.is_available,
        updated_at: new Date(),
      })
      .where(eq(menuItemsTable.id, menuItemId))
      .returning();

    if (category_id) {
      await db
        .delete(menuItemCategoriesTable)
        .where(eq(menuItemCategoriesTable.menu_item_id, menuItemId));

      await db.insert(menuItemCategoriesTable).values({
        menu_item_id: menuItemId,
        category_id: Number(category_id),
      });
    }

    return res.json({
      message: "Menu item updated successfully",
      menuItem,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update menu item" });
  }
};

// Delete menu item
export const deleteMenuItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const restaurantId = Number(req.params.restaurantId);
    const menuItemId = Number(req.params.id);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const restaurant = await verifyRestaurantOwnership(userId, restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const [existing] = await db
      .select()
      .from(menuItemsTable)
      .where(
        and(
          eq(menuItemsTable.id, menuItemId),
          eq(menuItemsTable.restaurant_id, restaurantId)
        )
      );

    if (!existing) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    await db
      .delete(menuItemCategoriesTable)
      .where(eq(menuItemCategoriesTable.menu_item_id, menuItemId));

    await db.delete(menuItemsTable).where(eq(menuItemsTable.id, menuItemId));

    return res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete menu item" });
  }
};

// Toggle menu item availability
export const toggleMenuItemAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const restaurantId = Number(req.params.restaurantId);
    const menuItemId = Number(req.params.id);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const restaurant = await verifyRestaurantOwnership(userId, restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const [existing] = await db
      .select()
      .from(menuItemsTable)
      .where(
        and(
          eq(menuItemsTable.id, menuItemId),
          eq(menuItemsTable.restaurant_id, restaurantId)
        )
      );

    if (!existing) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const [menuItem] = await db
      .update(menuItemsTable)
      .set({
        is_available: !existing.is_available,
        updated_at: new Date(),
      })
      .where(eq(menuItemsTable.id, menuItemId))
      .returning();

    return res.json({
      message: `Menu item ${menuItem.is_available ? "enabled" : "disabled"}`,
      menuItem,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get restaurant orders
export const getRestaurantOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const restaurantId = Number(req.params.restaurantId);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const restaurant = await verifyRestaurantOwnership(userId, restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const orders = await db
      .select({
        id: ordersTable.id,
        status: ordersTable.status,
        total_amount: ordersTable.total_amount,
        created_at: ordersTable.created_at,
        customer_id: ordersTable.customer_id,
        customer_name: usersTable.name,
        customer_phone: usersTable.phone,
      })
      .from(ordersTable)
      .leftJoin(usersTable, eq(ordersTable.customer_id, usersTable.id))
      .where(eq(ordersTable.restaurant_id, restaurantId))
      .orderBy(desc(ordersTable.created_at));

    return res.json({ orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update order status
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const restaurantId = Number(req.params.restaurantId);
    const orderId = Number(req.params.id);
    const { status } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const restaurant = await verifyRestaurantOwnership(userId, restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.id, orderId),
          eq(ordersTable.restaurant_id, restaurantId)
        )
      );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const [updatedOrder] = await db
      .update(ordersTable)
      .set({
        status,
        updated_at: new Date(),
      })
      .where(eq(ordersTable.id, orderId))
      .returning();

    return res.json({
      message: "Order status updated",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update restaurant details
export const updateRestaurant = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const restaurantId = Number(req.params.restaurantId);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { name, description, address, phone, is_open, delivery_time, delivery_fee } =
      req.body;

    const existing = await verifyRestaurantOwnership(userId, restaurantId);
    if (!existing) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    let imageUrl = existing.image_url;
    if (req.file) {
      const result: any = await uploadToCloudinary(req.file.buffer, "restaurants");
      imageUrl = result.secure_url;
    }

    const [restaurant] = await db
      .update(restaurantsTable)
      .set({
        name: name || existing.name,
        description: description !== undefined ? description : existing.description,
        address: address || existing.address,
        phone: phone || existing.phone,
        image_url: imageUrl,
        is_open: is_open !== undefined ? is_open : existing.is_open,
        delivery_time: delivery_time || existing.delivery_time,
        delivery_fee: delivery_fee || existing.delivery_fee,
        updated_at: new Date(),
      })
      .where(eq(restaurantsTable.id, restaurantId))
      .returning();

    return res.json({
      message: "Restaurant updated successfully",
      restaurant,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all categories (for menu item form)
export const getCategories = async (_req: AuthRequest, res: Response) => {
  try {
    const categories = await db.select().from(categoriesTable);
    return res.json({ categories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
