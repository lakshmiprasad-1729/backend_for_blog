import { ApiError, ApiResponse, asyncHandler } from "../custom/index.js";
import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";

const toggleSubscription =asyncHandler(async(req,res)=>{
    const {ownerid} = req.query;

    if(!ownerid && ownerid.trim()=='')
        throw new ApiError(400,"invalid details");


    const subscription = await Subscription.findOne({
        $and:[{ownerid},{subscriberid:req.user._id}]
    });


    if(!subscription){
        const createSubscription = await Subscription.create({
            ownerid:ownerid,
            subscriberid:req.user._id
        })

        if(!createSubscription)
            throw new ApiError(500,"unable to create Subscription")

        return res
        .json(new ApiResponse(200,true,"subscription created"))
    }

    const deleteSubscription = await Subscription.findByIdAndDelete(subscription._id);

    if(!deleteSubscription)
        throw new ApiError(500,"error occured while removing like");
    
    return res
    .json(new ApiResponse(200,false,"deleted successfully"))
})


const currentUserSubscriptionStatus = asyncHandler(async(req,res)=>{
    const {ownerid} = req.query;
    if(!ownerid && ownerid.trim()=='')
        throw new ApiError(400,"invalid details");

    const subscriptionStatus = await Subscription.findOne(
        {$and:[{ownerid},{subscriberid:req.user._id}]}
    )

    if(subscriptionStatus)
        return res.json(new ApiResponse(200,true,"subscribed"))
    else
        return res.json(new ApiResponse(200,false,"unsubscribed"))

})


export {
    currentUserSubscriptionStatus,
    toggleSubscription
}