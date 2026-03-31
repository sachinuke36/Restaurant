import { Request, Response } from "express";
import { db } from "../../db/drizzle";
import { usersTable } from "../../db/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        phone: usersTable.phone,
        created_at: usersTable.created_at,
      })
      .from(usersTable);

    return res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createDeliveryPerson = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required (name, email, phone, password)" });
    }

    // Check if user exists
    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existing) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(usersTable)
      .values({
        name,
        email,
        phone,
        password: hashedPassword,
        role: "delivery_person",
      })
      .returning({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        phone: usersTable.phone,
        role: usersTable.role,
        created_at: usersTable.created_at,
      });

    return res.status(201).json({
      message: "Delivery person account created successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
