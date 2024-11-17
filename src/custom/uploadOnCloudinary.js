import {v2 as cloudinary} from 'cloudinary'
import {ApiError} from './index.js'
import fs from 'fs'

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async(postImagePath)=>{
    try {
        const response = await cloudinary.uploader.upload(postImagePath,{
            resource_type:"auto"
        })
        fs.unlinkSync(postImagePath);
        return response.url;
    } catch (error) {
        fs.unlink(postImagePath)
        throw new ApiError(500,"due to internal serveror error file is not uploaded")
    }
}

export default uploadOnCloudinary