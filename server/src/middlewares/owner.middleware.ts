import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../../types/express";
import { db } from "../db/drizzle";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";

export const OwnerMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader)
      return res.status(401).json({ message: "Authorization Token is missing!" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Invalid Token format!" });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    // Fetch user from database to check role
    const [user] = await db
      .select({ id: usersTable.id, role: usersTable.role })
      .from(usersTable)
      .where(eq(usersTable.id, decoded.id));

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.role !== "owner") {
      return res.status(403).json({ message: "Access denied. Owner role required." });
    }

    req.user = {
      id: user.id,
    };

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
};
