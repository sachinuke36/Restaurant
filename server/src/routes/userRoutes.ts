import express from "express";
import * as userController from "../controllers/users/userController";
import { UsersMiddleware } from "../middlewares/users.middleware";

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", UsersMiddleware, userController.usersInfo)

//----------------------------------------------------------------------------
//----------------------- ADDRESS --------------------------------------------
//-----------------------------------------------------------------------------

router.get("/address", UsersMiddleware, userController.fetchAddress);
router.post("/address", UsersMiddleware, userController.addAddress);
router.put("/address/:id", UsersMiddleware, userController.updateAddress);
router.delete("/address/:id", UsersMiddleware, userController.deleteAddress);
router.patch("/address/:id/default", UsersMiddleware, userController.setDefaultAddress);



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


//----------------------------------------------------------------------------
//----------------------- PAYMENTS -------------------------------------------
//-----------------------------------------------------------------------------

router.post("/payments/create-intent", UsersMiddleware, userController.createPaymentIntent);

export default router;