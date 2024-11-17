import {model,Schema} from 'mongoose'

const commentSchema = new Schema({
    postid:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    commenterid:{
         type:Schema.Types.ObjectId,
         ref:"User"
    },
    comment:{
        type:String,
        required:true
    },
    commentedBy:{
        type:String,
        required:true
    }
},{timestamps:true})

export const Comment = model("Comment",commentSchema);