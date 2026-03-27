import { Router } from "express";
import { upload } from "../middlewares/upload";
import { createCategory, getAllCategories } from "../controllers/admin/categories";
import { UsersMiddleware } from "../middlewares/users.middleware";
import { AdminMiddleware } from "../middlewares/admin.middleware";

const router = Router();

router.post("/category", UsersMiddleware, AdminMiddleware ,upload.single("file"), createCategory);
router.get("/category", getAllCategories)

export default router;