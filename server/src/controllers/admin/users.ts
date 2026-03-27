import { Request, Response } from "express";
import { db } from "../../db/drizzle";
import { usersTable } from "../../db/schema";

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
