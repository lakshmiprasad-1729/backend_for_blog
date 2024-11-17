import mongoose, { Schema } from "mongoose";

const PostSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    section:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    imageurl:{
        type:String,
        required:true
    },
    ownerid:{
        type:Schema.Types.ObjectId,
        ref:"User",
       
    }
},{timestamps:true})


export const Post = mongoose.model("Post",PostSchema);