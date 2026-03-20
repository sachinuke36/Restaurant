import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import cors from "cors";
import { log } from "../utils/logger";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

app.use("/api/users", userRoutes);

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});