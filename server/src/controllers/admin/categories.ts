import { Request, Response } from "express";
import { uploadToCloudinary } from "../../services/cloudinary.service";
import { categoriesTable } from "../../db/schema";
import { db } from "../../db/drizzle";


export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!req.file || !name) {
      return res.status(400).json({
        message: "Name and image are required",
      });
    }

    const result: any = await uploadToCloudinary(
      req.file.buffer,
      "categories"
    );

    const category = await db.insert(categoriesTable).values({
      name,
      img_url: result.secure_url,
      publicId: result.public_id
    }).returning();

    return res.status(201).json({
      message: "Category created",
      category,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getAllCategories = async (req: Request, res: Response)=>{
  try {
    const categories = await db.select().from(categoriesTable)
    return res.status(200).json(categories)
  } catch (error) {
    console.log(error);
    return res.status(500).json({message:"Internal Server Error"})
  }
}