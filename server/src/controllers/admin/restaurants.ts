import { Request, Response } from "express";
import { db } from "../../db/drizzle";
import {
  categoriesTable,
  menuItemCategoriesTable,
  menuItemsTable,
  restaurantsTable,
} from "../../db/schema";
import { uploadToCloudinary } from "../../services/cloudinary.service";
import { eq, and, inArray } from "drizzle-orm";

export const addRestaurant = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const { name, address, owner_id, description, phone } = req.body;
    if (!name || !address || !owner_id || !phone)
      return res.status(400).json({ message: "All fields are required!" });

    if (!req.file) {
      return res.status(400).json({
        message: "image are required",
      });
    }
    const result: any = await uploadToCloudinary(
      req.file.buffer,
      "restaurants",
    );

    const restaurant = await db
      .insert(restaurantsTable)
      .values({
        name: name,
        address: address,
        owner_id: Number(owner_id),
        description: description,
        image_url: result.secure_url,
        publicId: result.public_id,
        phone,
      })
      .returning();

    return res.status(201).json({
      message: "Restaurant created",
      restaurant,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateRestaurant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, address, owner_id, description, phone } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "Restaurant id is required",
      });
    }

    if (!name || !address || !owner_id || !phone) {
      return res.status(400).json({
        message: "All fields are required!",
      });
    }

    let updateData: any = {
      name,
      address,
      owner_id: Number(owner_id),
      description,
      phone,
    };

    if (req.file) {
      const result: any = await uploadToCloudinary(
        req.file.buffer,
        "restaurants",
      );

      updateData.image_url = result.secure_url;
      updateData.publicId = result.public_id;
    }

    const restaurant = await db
      .update(restaurantsTable)
      .set(updateData)
      .where(eq(restaurantsTable.id, Number(id)))
      .returning();

    return res.status(200).json({
      message: "Restaurant updated successfully",
      restaurant,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const fetchRestaurants = async (req: Request, res: Response) => {
  try {
    const categoryId = req.query.category as string;

    let restaurants;

    if (categoryId && categoryId !== "all") {
      // Get restaurant IDs that have menu items in this category
      const menuItemsWithCategory = await db
        .select({ restaurant_id: menuItemsTable.restaurant_id })
        .from(menuItemsTable)
        .innerJoin(
          menuItemCategoriesTable,
          eq(menuItemCategoriesTable.menu_item_id, menuItemsTable.id)
        )
        .where(eq(menuItemCategoriesTable.category_id, Number(categoryId)));

      const restaurantIds = [
        ...new Set(menuItemsWithCategory.map((item) => item.restaurant_id)),
      ];

      if (restaurantIds.length === 0) {
        return res.status(200).json({
          message: "Restaurants fetched successfully",
          restaurants: [],
        });
      }

      restaurants = await db
        .select()
        .from(restaurantsTable)
        .where(
          and(
            inArray(restaurantsTable.id, restaurantIds),
            eq(restaurantsTable.is_active, true)
          )
        );
    } else {
      restaurants = await db
        .select()
        .from(restaurantsTable)
        .where(eq(restaurantsTable.is_active, true));
    }

    return res
      .status(200)
      .json({ message: "Restaurants fetched successfully", restaurants });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getRestaurantFullInfo = async (req: Request, res: Response) => {
  const restaurantId = Number(req.params.id);

  try {
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant id is required",
      });
    }

    // 1️⃣ Get restaurant
    const restaurant = await db
      .select()
      .from(restaurantsTable)
      .where(eq(restaurantsTable.id, restaurantId));

    // 2️⃣ Get menu items with category
    const menuItems = await db
      .select({
        id: menuItemsTable.id,
        name: menuItemsTable.name,
        price: menuItemsTable.price,
        image: menuItemsTable.img_url,
        category_id: categoriesTable.id,
        category_name: categoriesTable.name,
      })
      .from(menuItemsTable)
      .leftJoin(
        menuItemCategoriesTable,
        eq(menuItemCategoriesTable.menu_item_id, menuItemsTable.id)
      )
      .leftJoin(
        categoriesTable,
        eq(categoriesTable.id, menuItemCategoriesTable.category_id)
      )
      .where(eq(menuItemsTable.restaurant_id, restaurantId));

    // 3️⃣ Extract unique categories
    const categoriesMap = new Map();

    menuItems.forEach((item) => {
      if (!categoriesMap.has(item.category_id)) {
        categoriesMap.set(item.category_id, {
          id: item.category_id,
          name: item.category_name,
        });
      }
    });

    const categories = Array.from(categoriesMap.values());

    return res.status(200).json({
      success: true,
      restaurant: restaurant[0],
      categories,
      menuItems,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant info",
    });
  }
};
