import { Request, Response } from "express";
import { db } from "../../db/drizzle";
import { menuItemCategoriesTable, menuItemsTable } from "../../db/schema";
import { uploadToCloudinary } from "../../services/cloudinary.service";


export const addMenuItem = async (req: Request, res: Response) => {
  try {
    const { restaurant_id, name, description, img_url, price, category_id } =
      req.body;
    if (!restaurant_id || !name || !price || !category_id)
      return res.status(400).json({ message: "All fields are required!" });
    let imageUrl = img_url;

    if(req.file){
        const result: any = await uploadToCloudinary(req.file.buffer, "menu-items");
        imageUrl = result.secure_url;
    }

    

    const [menuItem]: any = await db
      .insert(menuItemsTable)
      .values({
        restaurant_id,
        name,
        description,
        price,
        img_url: imageUrl,
      })
      .returning();

    await db.insert(menuItemCategoriesTable).values({
      menu_item_id: menuItem.id,
      category_id,
    });

    return res.status(201).json({
      success: true,
      message: "Menu item added successfully",
      data: menuItem,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to add menu item",
    });
  }
};
