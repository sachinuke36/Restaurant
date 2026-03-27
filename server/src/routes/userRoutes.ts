import express from "express";
import * as userController from "../controllers/users/userController";
import { UsersMiddleware } from "../middlewares/users.middleware";

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/address", UsersMiddleware, userController.fetchAddress)
router.get("/profile", UsersMiddleware, userController.usersInfo)



//----------------------------------------------------------------------------
//----------------------- CART -----------------------------------------------
//-----------------------------------------------------------------------------

router.post("/cart/add-item", UsersMiddleware, userController.addItemToCart);
router.post("/cart/remove-item", UsersMiddleware, userController.removeItemFromCart);
router.get("/cart", UsersMiddleware, userController.getCart);
router.delete("/cart/clear", UsersMiddleware, userController.clearCart);
router.patch("/cart/update", UsersMiddleware, userController.updateCartItemQuantity )



//----------------------------------------------------------------------------
//----------------------- ORDERS ---------------------------------------------
//-----------------------------------------------------------------------------

router.post("/orders/place", UsersMiddleware, userController.placeOrder);
router.get("/orders", UsersMiddleware, userController.getMyOrders);
router.get("/orders/:id", UsersMiddleware, userController.getOrderDetails);
router.patch("/orders/:id/cancel", UsersMiddleware, userController.cancelOrder);

export default router;