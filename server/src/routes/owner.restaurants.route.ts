import { Router } from "express";
import { UsersMiddleware } from "../middlewares/users.middleware";
import * as restaurantControllers from '../controllers/owner/restaurantController'
import { upload } from "../middlewares/upload";

const router = Router();


router.post("/menu-items", UsersMiddleware, upload.single('file') ,restaurantControllers.addMenuItem);


export default router;