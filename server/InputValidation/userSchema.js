
const joi = require('@hapi/joi');
const {BackendError,VerificationError} = require('../lib/exception');

const RegistrationSchema = async (data)=>{const registerSchema = joi.object({
    name:joi.string().min(3).required(),
    username:joi.string().min(6).alphanum().required(),
    email:joi.string().min(6).email().required().lowercase(),
    password:joi.string().min(6).required()
});

try{
    return await registerSchema.validateAsync(data)
}catch(err)
{
    if(err instanceof joi.ValidationError){
        throw new VerificationError(err.details[0].message,400);
    }else{
        throw new BackendError();
    }
}

}

const LoginSchema = async (data)=>{
    const loginSchema = joi.object({
    email : joi.string().min(3),
    username:joi.string().min(6),
    password:joi.string().min(6).required(),
});

try{
    return await loginSchema.validateAsync(data)
}catch(err)
{
    if(err instanceof joi.ValidationError){
        throw new VerificationError(err.details[0].message,400);
    }else{
        throw new BackendError();
    }
}

}

const VerifySchema = async (data)=>{
    const loginSchema = joi.object({
    email : joi.string().min(3),
    username:joi.string().min(6),
    otp:joi.string().max(6).required()
});

try{
    return await loginSchema.validateAsync(data)
}catch(err)
{
    if(err instanceof joi.ValidationError){
        throw new VerificationError(err.details[0].message,400);
    }else{
        throw new BackendError();
    }
}

}

const EmailResendSchema = async (data)=>{
    const loginSchema = joi.object({
    email : joi.string().min(3),
    username:joi.string().min(6)
});

try{
    return await loginSchema.validateAsync(data)
}catch(err)
{
    if(err instanceof joi.ValidationError){
        throw new VerificationError(err.details[0].message,400);
    }else{
        throw new BackendError();
    }
}

}

const ResetPasswordSchema = async (data)=>{
    const loginSchema = joi.object({
    uid : joi.string().required(),
    e:joi.string().required(),
    token:joi.string().required(),
    newPassword:joi.string().required()
});

try{
    return await loginSchema.validateAsync(data)
}catch(err)
{
    if(err instanceof joi.ValidationError){
        throw new VerificationError(err.details[0].message,400);
    }else{
        throw new BackendError();
    }
}

}


// module.exports.RegistrationSchema = RegistrationSchema;
// module.exports.LoginSchema = LoginSchema;
module.exports = {VerifySchema,LoginSchema,RegistrationSchema,EmailResendSchema,ResetPasswordSchema};
