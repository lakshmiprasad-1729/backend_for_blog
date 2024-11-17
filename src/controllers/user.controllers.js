import { User } from "../models/user.model.js";
import {ApiError, ApiResponse,asyncHandler} from "../custom/index.js"
import bcrypt from 'bcrypt'
import mongoose from "mongoose";


async function generateTokens(userid){
    const user = await User.findById(userid);

    const accessToken =await user.createJwtAccessToken();
    const refreshToken=await user.createJwtRefreshToken();
    user.refreshToken=refreshToken;

    user.save({validateBeforeSave:false});

    return {accessToken,refreshToken};
}

const createUser = asyncHandler(async(req,res)=>{
    const {name,email,password} = req.body;
    
    if(name==''||email==''||password==''){
        throw new ApiError(400,"invalid details ,details shouldn't be empty")
    }

    const findUser = await User.findOne({email})

    if(findUser){
        throw new ApiError(400,"user Already exist")
    }

    const user = await User.create({
        name,
        email,
        password
    })

    if(!user){
        throw new ApiError(500,"user not created due to server error")
    }
    
    const createdUser = await User.findById(user._id).select("-password");

    return res
    .json(new ApiResponse(200,createdUser,"userCreated Successfully"));
});

const loginUser=asyncHandler(async(req,res)=>{
    const {email,password}=req.body;
    
    if(password==''||email==''||!email||!password)
        throw new ApiError(400,"credentials are required for login")

    const user = await User.findOne({email});

    if(!user)
        throw new ApiError(400,"user not exist");


    const result =await user.comparePassword(password);

     const verifiedUser = await User.findById(user._id).select("-password -refreshToken");

    if(!result)
        throw new ApiError(400,"Invalid credentials");

    const {accessToken,refreshToken} =await generateTokens(user._id);
    
    return res
    .cookie("accessToken",accessToken)
    .cookie("refreshToken",refreshToken)
    .json(new ApiResponse(200,verifiedUser,"user logged in successfully"))

})

const Logout=asyncHandler(async(req,res)=>{
    const result = await User.findByIdAndUpdate(
        req.user._id,
        {
           refreshToken:''
        }
    )


    if(!result)
        throw new ApiError(500,"internal server error try again")

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .cookie("accessToken",options)
    .cookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user successfully logged out"))
})

// const updateName=asyncHandler(async(req,res)=>{
//     const {name}= req.body;
//     if(!name)
//         throw new ApiError("name is required");

//     const user = await User.findByIdAndUpdate(
//         req.user._id,
//         {
//             name:name
//         }
//     )

//     if(!user)
//         throw new ApiError(500,"name is not changed due to internal server error")

//     return res
//     .json(new ApiResponse(200,user,"name changed successful"));
// })

const updateEmail=asyncHandler(async(req,res)=>{
    const {email,password}= req.body;
    if(!email)
        throw new ApiError("name is required");

    const checkUser = await User.findById(req.user._id);

    const compare = await checkUser.comparePassword(password);

    if(!compare)
        throw new ApiError(400,"invalid password");

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            email:email
        }
    )

    if(!user)
        throw new ApiError(500,"name is not changed due to internal server error")

    const updatedUser=await User.findById(user._id).select("-password -refreshToken");

    return res
    .json(new ApiResponse(200,updatedUser,"email changed successful"));
})

const updatePassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}= req.body;
    if(!oldPassword && !newPassword)
        throw new ApiError(400,"passwords are required");

    if(oldPassword.trim()===newPassword.trim())
        throw new ApiResponse(400,"both passwords shouldn't be same")

    const checkUser = await User.findById(req.user._id);

    const compare = await checkUser.comparePassword(oldPassword);

    if(!compare)
        throw new ApiError(400,"invalid password");

    const hashedPassword = await bcrypt.hash(newPassword,10);

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
           password:hashedPassword
        }
    )

    if(!user)
        throw new ApiError(500,"name is not changed due to internal server error")


    const updatedUser = await User.findById(user._id).select("-refreshToken -password");
    return res
    .json(new ApiResponse(200,updatedUser,"name changed successful"));
})


const findUserById=asyncHandler(async(req,res)=>{
    const {userid} = req.query;

    if(!userid || userid=='')
        throw new ApiError(400,"provide valid userid");

    const user = await User.aggregate([
        {
            $match:{
                '_id':new mongoose.Types.ObjectId(userid)
            }
        },
        {
            $lookup:{
                from:'subscriptions',
                localField:'_id',
                foreignField:'ownerid',
                as:'subscribers'
            }
        },
        {
            $lookup:{
                from:'subscriptions',
                localField:'_id',
                foreignField:'subscriberid',
                as:'subscribed',
                pipeline:[
                    {
                        $lookup:{
                            from:'users',
                            localField:'ownerid',
                            foreignField:'_id',
                            as:'accounts',
                            pipeline:[
                                {
                                    $project:{
                                        'name':1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind:'$accounts'
                    },
                    {
                        $project:{
                            '_id':0,
                            'accounts':1
                        }
                    }
                ]
            } 
        },
        {
            $project:{
                'name':1,
                'email': 1,
                'createdAt': 1,
                'subscribers':1,
                'subscribed':1
            }
        }
    ]);


    
    if(!user)
        throw new ApiError(500,"error while fetching user details,internal error");

    return res
    .json(new ApiResponse(200,user[0],"user details fetched successfully"));
})

const findCurrentUser=asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user_id).select("-password -refreshToken");

    if(!user)
        throw new ApiError(500,"internal server error while fetching current user details");

    return res
    .json(new ApiResponse(200,user,"current user details fetched successfully"))
})


export {
    createUser,
    loginUser,
    Logout,
    updateEmail,
    updatePassword,
    findUserById,
    findCurrentUser
}