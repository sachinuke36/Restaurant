import { Router } from "express";
import { OwnerMiddleware } from "../middlewares/owner.middleware";
import * as restaurantControllers from '../controllers/owner/restaurantController'
import { upload } from "../middlewares/upload";

const router = Router();

// Get all restaurants for owner
router.get("/restaurants", OwnerMiddleware, restaurantControllers.getMyRestaurants);

// Categories (doesn't need restaurant ID)
router.get("/categories", OwnerMiddleware, restaurantControllers.getCategories);

// Restaurant-specific routes (with :restaurantId param)
router.get("/restaurants/:restaurantId", OwnerMiddleware, restaurantControllers.getRestaurant);
router.put("/restaurants/:restaurantId", OwnerMiddleware, upload.single('file'), restaurantControllers.updateRestaurant);

// Menu items management
router.get("/restaurants/:restaurantId/menu-items", OwnerMiddleware, restaurantControllers.getMenuItems);
router.post("/restaurants/:restaurantId/menu-items", OwnerMiddleware, upload.single('file'), restaurantControllers.addMenuItem);
router.put("/restaurants/:restaurantId/menu-items/:id", OwnerMiddleware, upload.single('file'), restaurantControllers.updateMenuItem);
router.delete("/restaurants/:restaurantId/menu-items/:id", OwnerMiddleware, restaurantControllers.deleteMenuItem);
router.patch("/restaurants/:restaurantId/menu-items/:id/toggle", OwnerMiddleware, restaurantControllers.toggleMenuItemAvailability);

// Orders management
router.get("/restaurants/:restaurantId/orders", OwnerMiddleware, restaurantControllers.getRestaurantOrders);
router.patch("/restaurants/:restaurantId/orders/:id/status", OwnerMiddleware, restaurantControllers.updateOrderStatus);

export default router;
