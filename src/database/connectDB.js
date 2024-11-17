import mongoose from "mongoose";
import "dotenv/config"

const connectDB=async()=>{
  try {
    const DBinstance = await mongoose.connect(`${process.env.DATABASE_URL}/${process.env.DATABASE_NAME}`)
    DBinstance?console.log('data base is connected'):console.log("error at dbinstance",DBinstance);
    
  } catch (error) {
    console.log("error at database",error)
  }
}

export default connectDB;