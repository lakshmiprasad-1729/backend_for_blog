import { Router } from "express";
import { createPost,editPost,editImage, allPosts, nextPosts,prevPosts,findPostById,findPostsByOwnerId,usersPosts,usersPrevPosts,usersNextPosts, findUsersPostById,deletePost } from "../controllers/post.controllers.js";
import upload from "../middlewares/multer.middleware.js";
import authmiddleware from "../middlewares/auth.middleware.js";

const postRouter = Router();


postRouter
.route('/add-post').post(authmiddleware,upload.single("postImage"),createPost)
postRouter
.route('/edit-post').patch(editPost)
postRouter
.route('/edit-image').patch(upload.single('postImage'),editImage)
postRouter
.route('/all-posts').get(allPosts)
postRouter
.route('/next-posts').get(nextPosts)
postRouter
.route('/prev-posts').get(prevPosts)

postRouter
.route('/get-post-by-id').get(findPostById)

postRouter
.route('/get-users-post-by-id').get(authmiddleware,findUsersPostById)

postRouter
.route('/get-posts-by-ownerid').get(findPostsByOwnerId)

postRouter
.route('/get-current-users-posts').get(authmiddleware,usersPosts);

postRouter
.route('/get-current-users-next-posts').get(authmiddleware,usersNextPosts);

postRouter
.route('/get-current-user-prev-posts').get(authmiddleware,usersPrevPosts);

postRouter
.route('/delete-post').post(authmiddleware,deletePost)
export default postRouter;