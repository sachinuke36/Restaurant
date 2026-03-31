import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import cors from "cors";
import { log } from "../utils/logger";
import categoryRoutes from './routes/categories.route'
import restaurantRoutes from './routes/restaurants.route'
import ownerRestaurantRoutes from './routes/owner.restaurants.route'
import adminUserRoutes from './routes/admin.users.route'
import deliveryRoutes from './routes/delivery.route'

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

app.use("/api/users", userRoutes);
app.use("/api/admin", categoryRoutes )
app.use("/api/admin/app", restaurantRoutes)
app.use("/api/owner", ownerRestaurantRoutes)
app.use("/api/admin", adminUserRoutes)
app.use("/api/delivery", deliveryRoutes)

app.listen(3000, "0.0.0.0", () => {
  log.info("Server running on port 3000");
});