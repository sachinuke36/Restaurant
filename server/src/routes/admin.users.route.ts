
import { Router } from "express";
import { getAllUsers, createDeliveryPerson } from "../controllers/admin/users";
import { UsersMiddleware } from "../middlewares/users.middleware";
import { AdminMiddleware } from "../middlewares/admin.middleware";

const router = Router();

router.get("/users", UsersMiddleware, AdminMiddleware, getAllUsers);
router.post("/users/delivery-person", UsersMiddleware, AdminMiddleware, createDeliveryPerson);

export default router;