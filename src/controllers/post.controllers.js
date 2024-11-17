import { Post } from "../models/post.model.js";
import {asyncHandler,ApiError,ApiResponse, uploadOnCloudinary} from '../custom/index.js'
import mongoose from "mongoose";
import { User } from "../models/user.model.js";


const createPost=asyncHandler(async(req,res)=>{
    
    const {title,section,description} = req.body;
    
    
    if(title.trim()==''||description.trim()=='')
        throw new ApiError('proper details are required')
    
    const imageFilePath = req.file!='' || req.file!=undefined?req.file.path:false;
    if(!imageFilePath)
        throw new ApiError(400,"image is required")

    const imageurl = await uploadOnCloudinary(imageFilePath);
    const post =await Post.create({
       title,
       section,
       description,
       imageurl:imageurl,
       ownerid:req.user._id
    })
    if(!post)
        throw new ApiError(500,"internal server error while creating post");

    return res
    .json(new ApiResponse(200,post,"post created successfully"))
})

const deletePost=asyncHandler(async(req,res)=>{
    const {postid} = req.query;

    if(!postid)
        throw new ApiError(400,"postid mush be provided")

    const user= await Post.findById(postid);
    if(!user)
        throw new ApiError(400,"post not exist valid post id is required")

    const post = await Post.findByIdAndDelete(postid);

    if(!post)
        throw new ApiError(500,"error while deleting post");

    return res
    .json(new ApiResponse(200,{},"post deleted successfully"));
})

const findPostById=asyncHandler(async(req,res)=>{
    const {postid} = req.query;
   
    if(!postid)
        throw new ApiError(400,"postid mush be provided")

    const post = await Post.aggregate([
        {
            $match:{
                '_id':new mongoose.Types.ObjectId(postid)
            }
        },{
            $lookup:{
                from:'users',
                localField:'ownerid',
                foreignField:'_id',
                as:'owner'
            }
        },
        {
           $unwind:'$owner'
        },
        {
            $project:{
                'description':1,
                'imageurl':1,
                'ownerid':1,
                'section':1,
                'title':1,
                'owner.name':1,
                'owner.createdAt':1,
            }
        }
    ])

    

    if(!post)
        throw new ApiError(400,"invalid user");

    return res
    .json(new ApiResponse(200,post,"post fetched successfullly"))

})

const findUsersPostById = asyncHandler(async(req,res)=>{
    const {postid} = req.query;
   
    if(!postid)
        throw new ApiError(400,"postid mush be provided")

    const post = await Post.aggregate([
        {
            $match:{
                '_id':new mongoose.Types.ObjectId(postid),
                'ownerid':new mongoose.Types.ObjectId(req.user._id)
            }
        },{
            $lookup:{
                from:'users',
                localField:'ownerid',
                foreignField:'_id',
                as:'owner'
            }
        },
        {
           $unwind:'$owner'
        },
        {
            $project:{
                'description':1,
                'imageurl':1,
                'ownerid':1,
                'section':1,
                'title':1,
                'owner.name':1,
                'owner.createdAt':1,
            }
        }
    ])

    

    if(!post)
        throw new ApiError(400,"invalid ");

    return res
    .json(new ApiResponse(200,post,"post fetched successfullly"))
})

const editPost= asyncHandler(async(req,res)=>{
    const {postid} = req.query;
    const data = req.body;
    if(!postid)
        throw new ApiError(400,"postid is required")
    
    const user= await Post.findById(postid);
    if(!user)
        throw new ApiError(400,"post not exist valid post id is required")

    const post = await Post.findByIdAndUpdate(
        postid,
        data
    )

    if(!post)
        throw new ApiError(500,"error occured while editing post")

    const updatedPost = await Post.findById(post._id);

    return res
    .json(new ApiResponse(200,updatedPost,'data changed successfully'))
})

const editImage= asyncHandler(async(req,res)=>{
    const {postid} = req.query;

    if(!req.file)
        throw new ApiError(400,"image is required")
    
    const createdPost= await Post.findById(postid);

    if(!createdPost)
        throw new ApiError(400,"post not exist valid post id is required")

    const response = await uploadOnCloudinary(req.file.path);

    const post = await Post.findByIdAndUpdate(
        postid,
        {
            imageurl:response
        }
    )

    if(!post)
        throw new ApiError(500,"error occured while editing image in post")

    const updatedPost = await Post.findById(post._id);

    
    return res
    .json(new ApiResponse(200,updatedPost,"image updated successfully"));

})

const allPosts = asyncHandler(async(req,res)=>{
    const all_posts = await Post.aggregate([
        {
            $match:{}
        },
        // {
        //    $sort:{cre}
        // },
        {
            $limit:10
        },
        {
            $lookup:{
                from:'users',
                localField:'ownerid',
                foreignField:'_id',
                as:'owner'
            }
        },
        {
            $unwind:'$owner'
        },
        {
            $project:{'owner.name':1,'owner.email':1,'title':1,'description':1,'section':1,'imageurl':1,'ownerid':1,'createdAt':1}
        }
    ])

    return res
    .json(new ApiResponse(200,all_posts,"all posts are fetched"))
})

const nextPosts = asyncHandler(async(req,res)=>{
   const {nextid} = req.query;
   
   if(!nextid)
    throw new ApiError(400,"invalid details");
   if(nextid.trim()=='')
    throw new ApiError(400,"invalid details");

   const nextposts= await Post.aggregate([
    {
       $match:{'_id':{$gt:new mongoose.Types.ObjectId(nextid)}}
    },{
        $limit:10
    },{
        $lookup:{
            from:'users',
            localField:'ownerid',
            foreignField:'_id',
            as:'owner'
        }
    },
    {
        $unwind:'$owner'
    },
    {
        $project:{'owner.name':1,'owner.email':1,'title':1,'description':1,'section':1,'imageurl':1,'ownerid':1,'createdAt':1}
    }
   ])

   return res
   .json(new ApiResponse(200,nextposts,"fetched successfully"))
})

const prevPosts = asyncHandler(async(req,res)=>{
    const {previd} = req.query;

    if(!previd )
        throw new ApiError(400,"invalid details");

    if(previd.trim()=='')
        throw new ApiError(400,"invalid details");
 
    const prevposts= await Post.aggregate([
     {
        $match:{'_id':{$lt:new mongoose.Types.ObjectId(previd)}}
     },{
         $limit:10
     },{
         $lookup:{
             from:'users',
             localField:'ownerid',
             foreignField:'_id',
             as:'owner'
         }
     },
     {
         $unwind:'$owner'
     },
     {
         $project:{'owner.name':1,'owner.email':1,'title':1,'description':1,'section':1,'imageurl':1,'ownerid':1,'createdAt':1}
     }
    ])

    if(!prevposts)
        throw new ApiError(500,"unable to fetch details due to server error")
 
    return res
    .json(new ApiResponse(200,prevposts,"fetched successfully"))
 })

 const usersPosts=asyncHandler(async(req,res)=>{
    const posts = await Post.aggregate([
        {
            $match:{
                'ownerid':new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $limit:10
        },
        {
            $lookup:{
                from:'users',
                localField:'ownerid',
                foreignField:'_id',
                as:'owner'
            }
        },
        {
            $unwind:'$owner'
        },
        {
            $project:{'owner.name':1,'owner.email':1,'title':1,'description':1,'section':1,'imageurl':1,'ownerid':1,'createdAt':1}
        }
    ])

    if(!posts)
        throw new ApiError(500,"posts are not fetched due to internal problem")

    return res
    .json(new ApiResponse(200,posts,"fetched successfully"))
 })

 const usersNextPosts = asyncHandler(async(req,res)=>{
    const {nextid} = req.query;
 
    const nextposts= await Post.aggregate([
     {
        $match:{'_id':{$gt:new mongoose.Types.ObjectId(nextid)} ,'ownerid':new mongoose.Types.ObjectId(req.user._id)}
     },{
         $limit:10
     },{
         $lookup:{
             from:'users',
             localField:'ownerid',
             foreignField:'_id',
             as:'owner'
         }
     },
     {
         $unwind:'$owner'
     },
     {
         $project:{'owner.name':1,'owner.email':1,'title':1,'description':1,'section':1,'imageurl':1,'ownerid':1,'createdAt':1}
     }
    ])
 
    return res
    .json(new ApiResponse(200,nextposts,"fetched successfully"))
 })

 const usersPrevPosts = asyncHandler(async(req,res)=>{
    const {previd} = req.query;

    if(!previd && previd.trim()=='')
        throw new ApiError(400,"invalid details");
 
    const prevposts= await Post.aggregate([
     {
        $match:{'_id':{$lt:new mongoose.Types.ObjectId(previd)} ,'ownerid':new mongoose.Types.ObjectId(req.user._id)}
     },{
         $limit:10
     },{
         $lookup:{
             from:'users',
             localField:'ownerid',
             foreignField:'_id',
             as:'owner'
         }
     },
     {
         $unwind:'$owner'
     },
     {
         $project:{'owner.name':1,'owner.email':1,'title':1,'description':1,'section':1,'imageurl':1,'ownerid':1,'createdAt':1}
     }
    ])

    if(!prevposts)
        throw new ApiError(500,"unable to fetch details due to server error")
 
    return res
    .json(new ApiResponse(200,prevposts,"fetched successfully"))
 })

 
 
const findPostsByOwnerId= asyncHandler(async(req,res)=>{
    const {ownerid}=req.query;
    if(ownerid.trim()=='' )
        throw new ApiError(400," ownerid is needed")

    const user = await User.findById(ownerid);

    if(!user)
        throw new ApiError(400,"invalid ownerid")

    const posts = await Post.aggregate([
        {
            $match:{
                'ownerid':new mongoose.Types.ObjectId(ownerid)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:'ownerid',
                foreignField:'_id',
                as:'owner'
            }
        },
        {
            $unwind:'$owner'
        },
        {
            $project:{
               'title':1,'description':1,'owner.name':1,'ownerid':1,'section':1
            }
        }
    ])
    return res
    .json(new ApiResponse(200,posts,"fetched successfully"))
})
 


export {
    createPost,
    deletePost,
    editPost,
    editImage,
    findPostById,
    findUsersPostById,
    allPosts,
    nextPosts,
    prevPosts,
    findPostsByOwnerId,
    usersPosts,
    usersNextPosts,
    usersPrevPosts
}