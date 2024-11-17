import { Router } from "express";
import { createUser,loginUser,Logout, updateEmail, updatePassword,findUserById,findCurrentUser } from "../controllers/user.controllers.js";
import upload from "../middlewares/multer.middleware.js";
import authmiddleware from "../middlewares/auth.middleware.js";

const userRouter =Router();

userRouter
.route('/register').post(upload.none(),createUser);
userRouter
.route('/login').post(loginUser)
userRouter
.route('/logout').patch(authmiddleware,Logout)
userRouter
.route('/change-email').patch(authmiddleware,updateEmail)
userRouter
.route('/change-password').patch(authmiddleware,updatePassword)
userRouter
.route('/get-current-user').get(authmiddleware,findCurrentUser)
userRouter
.route('/get-user-by-id').get(findUserById);


export default userRouter;