import express from "express";
import * as restaurantControllers from '../controllers/admin/restaurants'
import { UsersMiddleware } from "../middlewares/users.middleware";
import { AdminMiddleware } from "../middlewares/admin.middleware";
import { upload } from "../middlewares/upload";

const router = express.Router();

router.post("/restaurant", UsersMiddleware, AdminMiddleware, upload.single("file"), restaurantControllers.addRestaurant);
router.get("/restaurants", restaurantControllers.fetchRestaurants);
router.get("/restaurants/:id", restaurantControllers.getRestaurantFullInfo);
router.patch("/restaurant", UsersMiddleware, AdminMiddleware, upload.single("file"), restaurantControllers.updateRestaurant)

export default router;