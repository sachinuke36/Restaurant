import { AuthRequest } from "../../types/express";
import { NextFunction, Response } from "express";
import { db } from "../db/drizzle";
import { usersTable, userRoleEnum } from "../db/schema";
import { eq } from "drizzle-orm";

export const AdminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized!",
      });
    }

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user.length) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user[0].role !== 'admin') {
      return res.status(403).json({
        message: "Access denied. Admins only.",
      });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};