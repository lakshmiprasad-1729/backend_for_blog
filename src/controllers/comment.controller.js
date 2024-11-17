import { Comment } from "../models/comment.model.js";
import {asyncHandler,ApiError, ApiResponse} from "../custom/index.js"
import mongoose from "mongoose";

const createComment= asyncHandler(async(req,res)=>{
    const {comment} = req.body;
    const {postid} = req.query;

    if(!comment  && !postid)
        throw new ApiError(400,"comment shouldn't be empty");

    // if([comment,postid].some(ele=>ele.trim()==''))
    //     throw new ApiError(400,"details shouldn't be empty");

    const createdComment = await Comment.create({
         postid:postid,
         commenterid:req.user._id,
         comment:comment,
         commentedBy:req.user.name
    })
    if(!createdComment)
        throw new ApiError(500,"internal server error while creating comment");

    return res
    .json(new ApiResponse(200,createdComment,"comment created successfully"))
})


const deleteComment = asyncHandler(async(req,res)=>{
    const {commentid} = req.query;
    if(!commentid)
        throw new ApiError(400,"valid details are required")

    if(commentid.trim()=='')
        throw new ApiError(400,'invalid commentid')

    const comment = await Comment.findById(commentid);

    if(!comment)
        throw new ApiError(400,"invalid commentid")

    const deleteComment = await Comment.findByIdAndDelete(comment._id);

    if(!deleteComment)
        throw new ApiError(500,"internal server error while deleting coment")

    return res
    .json(new ApiResponse(200,deleteComment,"comment deleted successfully"))
})

const editComment = asyncHandler(async(req,res)=>{
    const {commentid} = req.query;
    const {comment} = req.body;

    if(!commentid && !comment)
        throw new ApiError(400,"invalid details")

    if([commentid,comment].some(ele=>ele.trim()==''))
        throw new ApiError(400,"details musn't be empty");

    const checkComment = await Comment.findById(commentid);

    if(!checkComment)
        throw new ApiError(400,"invalid commentid")


    const updatedComment =  await Comment.findByIdAndUpdate(
        commentid,
        {
            comment:comment
        }
    )

    if(updatedComment)
        throw new ApiError(500,"error occured while updating comment");

    return res
    .json(new ApiResponse(200,updatedComment,"comment successfully updated"))
})

const getComments = asyncHandler(async(req,res)=>{
    const {postid} = req.query;

    if(!postid && postid.trim()=='')
        throw new ApiError(400,"invalid details")

    const comments = await Comment.aggregate([
        {
            $match:{
                'postid':new mongoose.Types.ObjectId(postid)
            }
        }
    ])
    
    if(!comments)
        throw new ApiError(500,"internal server error while fetching comments");

    return res
    .json(new ApiResponse(200,comments,"data fetched successfully"))
})

export {
    createComment,
    deleteComment,
    editComment,
    getComments
}