import mongoose, { model, Schema } from "mongoose";

const subscriptionSchema = new Schema({
    ownerid:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    subscriberid:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
},{timestamps:true})

export const  Subscription = model("Subscription",subscriptionSchema);