import { Router } from "express";

import orderController from "../controllers/order.controller";
import authMiddleware from "../middlewares/auth.middleware";

const orderRoutes = Router();

orderRoutes.get("/order", authMiddleware, orderController.getAll);
orderRoutes.post("/order", authMiddleware, orderController.create);
orderRoutes.get("/order/:id", authMiddleware, orderController.getOne);
// orderRoutes.put("/order/:id", authMiddleware, orderController.update);
// orderRoutes.delete("/order/:id", authMiddleware, orderController.delete);

export { orderRoutes };
