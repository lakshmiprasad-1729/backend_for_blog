
const asyncHandler =(myfunction)=>{
    return async(req,res,next)=>{
       try {
          await myfunction(req,res,next);
       } catch (error) {
          res.json({
            status:error.status || 500,
            message:error.message
          })
       }
    }
}

export default asyncHandler