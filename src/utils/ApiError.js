class ApiError extends Error{
    constructor(statusCode,message="Internal Server Error",stack="",error=[]){
        super(message)
        this.statusCode=statusCode;
        this.data=null;
        this.message=message;
        this.error=error;
        this.success=false;
        if(stack){
            this.stack=stack;
        }
        else{
            Error.captureStackTrace(this,this.constructor);
        }
    }
}
export { ApiError };