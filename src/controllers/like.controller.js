import { ApiError, ApiResponse, asyncHandler } from "../custom/index.js";
import { Like } from "../models/likes.model.js";
import mongoose from "mongoose";

const toggleLike =asyncHandler(async(req,res)=>{
    const {postid} = req.query;

    const like = await Like.findOne({
        $and:[{postid},{userid:req.user._id}]
    });

    if(!like){
        const createLike = await Like.create({
            postid:postid,
            userid:req.user._id
        })

        if(!createLike)
            throw new ApiError(500,"unable to create like")

        return res
        .json(new ApiResponse(200,true,"like created"))
    }

    const deleteLike = await Like.findByIdAndDelete(like._id);

    if(!deleteLike)
        throw new ApiError(500,"error occured while removing like");
    
    return res
    .json(new ApiResponse(200,false,"deleted successfully"))
})

const  getLikeDetailsById=asyncHandler(async(req,res)=>{
    const {postid} = req.query;
    if(!postid && postid.trim()=='')
        throw new ApiError(400,"invalid details");

    const noOfLikes=await Like.aggregate([
        {
            $match:{
                'postid':new mongoose.Types.ObjectId(postid)
            }
        },
        {
            $group:{
                _id:"nooflikes",
                count:{$sum:1}
            }
        }
    ])


    if(!noOfLikes)
        throw new ApiError(500,"serveror at counting likes");

    return res
    .json(new ApiResponse(200,noOfLikes,"fetched successfully"));
})

const currentUserLikeStatus = asyncHandler(async(req,res)=>{
    const {postid} = req.query

    if(!postid && postid.trim()=='')
        throw new ApiError(400,"invalid details");

    const likeStatus = await Like.findOne(
        {$and:[{userid:req.user._id},{postid:postid}]}
    )

    if(likeStatus)
        return res.json(new ApiResponse(200,true,"liked post"))
    else
        return res.json(new ApiResponse(200,false,"liked post"))

})


export {
    toggleLike,
    getLikeDetailsById,
    currentUserLikeStatus
}