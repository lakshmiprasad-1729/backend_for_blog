import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import JWT from 'jsonwebtoken'

const userSchema = new Schema({
    name:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    password:{
       type:String,
       required:true,
    },
    followers:[
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    following:[
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    refreshToken:{
        type:String,
    }
},{timestamps:true})

userSchema.pre('save',async function(next){
    if(!this.isModified("password")) next();

    this.password = await bcrypt.hash(this.password,10);
})

userSchema.methods.comparePassword=async function(password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.createJwtAccessToken=function() {
    return JWT.sign(
        {
            _id:this._id,
            name:this.name,
            email:this.email
        },
        process.env.SECRET_JWT_ACCESSTOKEN,
        {
            expiresIn:process.env.SECRET_JWT_ACCESSTOKEN_EXPIRY
        }
    )
    
}

userSchema.methods.createJwtRefreshToken=function() {
    return JWT.sign(
        {
            _id:this._id,
        },
        process.env.SECRET_JWT_REFRESHTOKEN,
        {
            expiresIn:process.env.SECRET_JWT_REFRESHTOKEN_EXPIRY
        }
    )
    
}


export const User = mongoose.model("users",userSchema)