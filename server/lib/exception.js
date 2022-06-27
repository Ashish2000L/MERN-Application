class VerificationError extends Error {

    constructor(message,status=400,statusCode=null){
        
        super(message);

        Error.captureStackTrace(this,this.constructor);

        this.name = this.constructor.name;
        this.status = status;
        this.message = message;
        this.statusCode = statusCode
    }

    getStatus(){
        return this.status;
    }

    getMessage(){
        return this.message;
    }

    getStatusCode(){
        return this.statusCode;
    }
}

class EmailSendError extends Error {

    constructor(message,status=422,statusCode=null){
        
        super(message);

        Error.captureStackTrace(this,this.constructor);

        this.name = this.constructor.name;
        this.status = status;
        this.message = message;
        this.statusCode = statusCode
    }

    getStatus(){
        return this.status;
    }

    getMessage(){
        return this.message;
    }

    getStatusCode(){
        return this.statusCode;
    }
}

class ProxyUseError extends Error {

    constructor(message,status=403,statusCode=null){
        
        super(message);

        Error.captureStackTrace(this,this.constructor);

        this.name = this.constructor.name;
        this.status = status;
        this.message = message;
        this.statusCode = statusCode
    }

    getStatus(){
        return this.status;
    }

    getMessage(){
        return this.message;
    }

    getStatusCode(){
        return this.statusCode;
    }
}

class BackendError extends Error{
    constructor(){

        super(this.constructor.name)

        Error.captureStackTrace(this,this.constructor);

        this.name = this.constructor.name;
        this.status = 500;
        this.message="An error occured!!"
        this.statusCode = "error"
    }

    getStatus(){
        return this.status;
    }

    getMessage(){
        return this.message;
    }
    getStatusCode(){
        return this.statusCode;
    }
}


module.exports = {VerificationError,BackendError,EmailSendError,ProxyUseError};