import { Request, Response } from "express";
import * as userService from "../../services/userServices";
import { db } from "../../db/drizzle";
import { usersTable } from "../../db/schema";
import { eq } from "drizzle-orm";

export const register = async (req: Request, res: Response) => {
  try {
    const {email, password, name, phone} = req.body;

    if (!email || !password || !name || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const isExistingUser = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (isExistingUser.length > 0) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await userService.generateHashedPasswordWithSalt(password);

    const user: typeof usersTable.$inferInsert = {
    name,
    email,
    password: hashedPassword,
    phone: phone,
    role: "customer"
  };

    const data = await db.insert(usersTable).values(user).returning(); 
    const userdata = data[0];
    const { password: _, ...safeUser } = userdata;

    
    const token = userService.generateToken(safeUser);
    res.status(201).json({ ...safeUser, token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};