import JWT from 'jsonwebtoken'
import {asyncHandler,ApiError} from '../custom/index.js'
import { User } from '../models/user.model.js';

const authmiddleware=asyncHandler(async(req,res,next)=>{
        const token = req.cookies.accessToken;
       
        if(!token)
            throw new ApiError(400,"Invalid Authorization")
    
        const decodedUser = JWT.verify(token,process.env.SECRET_JWT_ACCESSTOKEN);

        const user = await User.findById(decodedUser._id).select("-password -refreshToken");

        if(!user)
            throw new ApiError(400,"invalid token")

        req.user=user;
        next();

       
    }
)

export default authmiddleware