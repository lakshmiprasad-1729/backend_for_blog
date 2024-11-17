import mongoose, { model, Schema } from 'mongoose'

const likeSchema = new Schema({
    userid:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    postid:{
        type:Schema.Types.ObjectId,
        ref:"Post"
    }
},{timestamps:true})


export const Like =model("Like",likeSchema);