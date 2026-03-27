
import { Router } from "express";
import { getAllUsers } from "../controllers/admin/users";
import { UsersMiddleware } from "../middlewares/users.middleware";
import { AdminMiddleware } from "../middlewares/admin.middleware";

const router = Router();

router.get("/users", UsersMiddleware, AdminMiddleware, getAllUsers);

export default router;