class ApiResponse{
    constructor(statusCode,data,message){
        this.status =statusCode
        this.data = data
        this.message = message
    }
}

export default ApiResponse;