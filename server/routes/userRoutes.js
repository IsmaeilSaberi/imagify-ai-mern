import express from "express";
import {
  registerUser,
  loginUser,
  userCredits,
  stripePayment,
} from "../controllers/userController.js";
import userAuth from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/credits", userAuth, userCredits);
userRouter.post("/pay-stripe", userAuth, stripePayment);

export default userRouter;
