import {Router} from "express";
import shareController from "../controllers/share.controller";
import authMiddleware from "../middlewares/auth.middleware";

const userRoutes = Router();

userRoutes.get("/share", shareController.listShares);
userRoutes.post("/share", authMiddleware, shareController.add);
userRoutes.get("/share/:symbol", shareController.listOrderBook);


export { userRoutes };

