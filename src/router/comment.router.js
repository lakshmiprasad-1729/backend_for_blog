import { Router } from "express";
import { createComment,deleteComment,editComment, getComments } from "../controllers/comment.controller.js";
import authmiddleware from '../middlewares/auth.middleware.js'

const  commentRouter = Router();

commentRouter
.route('/add-comment').post(authmiddleware,createComment)
commentRouter
.route('/delete-comment').post(deleteComment)
commentRouter
.route('/edit-comment').patch(editComment)
commentRouter
.route('/get-comments').get(getComments)

export default commentRouter;