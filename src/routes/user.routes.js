import { Router } from "express";
import userController from "../controllers/user.controller";
import authMiddleware from "../middlewares/auth.middleware";

const userRoutes = Router();


userRoutes.get("/user", userController.get);
userRoutes.put("/user", authMiddleware, userController.update);

userRoutes.get("/user/:id", userController.find);
userRoutes.delete("/user/:id", userController.delete);


export { userRoutes };  
