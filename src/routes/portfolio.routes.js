import { Router } from "express";
import portfolioController from "../controllers/portfolio.controller";
import authMiddleware from "../middlewares/auth.middleware";

const portfolioRoutes = Router();


portfolioRoutes.get("/portfolio", authMiddleware, portfolioController.get);
portfolioRoutes.post("/portfolio", authMiddleware, portfolioController.add);



export { portfolioRoutes };
