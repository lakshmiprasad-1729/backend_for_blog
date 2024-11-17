import { Router } from "express";
import authmiddleware from "../middlewares/auth.middleware.js";
import {toggleLike,getLikeDetailsById,currentUserLikeStatus} from "../controllers/like.controller.js";

const likeRouter = Router();

likeRouter
.route('/toggle-like').post(authmiddleware,toggleLike);

likeRouter
.route('/get-likes').get(getLikeDetailsById);
likeRouter
.route('/get-current-user-like-status').get(authmiddleware,currentUserLikeStatus);


export default likeRouter;