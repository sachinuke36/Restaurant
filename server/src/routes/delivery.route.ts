import { Router } from "express";
import { DeliveryMiddleware } from "../middlewares/delivery.middleware";
import * as deliveryController from '../controllers/delivery-person/deliveryController';

const router = Router();

// Available orders (ready for pickup)
router.get("/available-orders", DeliveryMiddleware, deliveryController.getAvailableOrders);

// Pick/assign an order
router.post("/orders/:orderId/pick", DeliveryMiddleware, deliveryController.pickOrder);

// My deliveries (active and completed)
router.get("/my-deliveries", DeliveryMiddleware, deliveryController.getMyDeliveries);

// Delivery details
router.get("/deliveries/:id", DeliveryMiddleware, deliveryController.getDeliveryDetails);

// Update delivery status
router.patch("/deliveries/:id/status", DeliveryMiddleware, deliveryController.updateDeliveryStatus);

// Earnings
router.get("/earnings", DeliveryMiddleware, deliveryController.getEarnings);

// Delivery history
router.get("/history", DeliveryMiddleware, deliveryController.getDeliveryHistory);

export default router;
