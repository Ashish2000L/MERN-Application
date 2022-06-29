const app = require("express");
const route = app.Router();
const User = require('../model/User');
const {checkUnique,bCryptEncrypt,createJWT,sendError,sendMessage,filterNull,stringGen,base64Enc
    ,verifyEmail,resendEmail,ForgotPassword, ResetPassword,verifyGCaptcha,verifyCookies} = require('../utils/utils');
const {sendNodeMail} = require('../lib/emailManager')
const {otpEmailTemplate,resetPasswordTemplate,newLocationDetectedTemplate} = require('../lib/constants');

const {RegistrationSchema, LoginSchema,VerifySchema,EmailResendSchema, ResetPasswordSchema}  = require('../InputValidation/userSchema')

route.post('/register',verifyGCaptcha,async (req,res)=>{
    try{
        req.body = filterNull(req.body);
    await RegistrationSchema(req.body);    

    // await new Promise(resolve => setTimeout(resolve, 10000));
    await checkUnique({email:req.body.email, username:req.body.username});
    const otp = stringGen(6);

    // await sendNodeMail(req.body.email,req.body.name,"OTP for Email verification",otpEmailTemplate(req.body.name,otp))

    const user = new User({
        name:req.body.name,
        email:req.body.email,
        password:await bCryptEncrypt(req.body.password),
        username:req.body.username,
        otp:base64Enc("123456")
    })

    const savedUser = await user.save();

    return sendMessage(res,"Email sent Successfully!")

    }catch(err){

        console.log(err.stack)

        return sendError(res,err)
            
    }
})


route.post('/login',verifyGCaptcha,verifyCookies, async (req,res)=>{
    try{
    req.body = filterNull(req.body)
    await LoginSchema(req.body);    

    const {jwt_token,newLocation,location,uip,time,user} = await createJWT(req,filterNull({username:req.body.username,email:req.body.email}),req.body.password);

    // if(newLocation)
    //     await sendNodeMail(user.email,user.name,"New login location",newLocationDetectedTemplate(user.name,uip,location,time));

    return sendMessage(res,null,null,{"Authorization":`Bearer ${jwt_token}`})

    }catch(err){
    
        console.log(err.stack)

        return sendError(res,err)
            
    }  
    
})

route.post('/verify',async (req,res)=>{
    try{
    req.body = filterNull(req.body)
    await VerifySchema(req.body);    
    
    await verifyEmail(filterNull({username:req.body.username,email:req.body.email}),req.body.otp)

    return sendMessage(res,"Email successfully Verified!")

    }catch(err){
    
        console.log(err.stack)

        return sendError(res,err)       
            
    }  
    
})

route.post('/sendEmail',async (req,res)=>{
    try{
    req.body = filterNull(req.body)
    await EmailResendSchema(req.body);    
    
    const otp = stringGen(6);

    const user = await resendEmail(filterNull({username:req.body.username,email:req.body.email}),"123456")

    // await sendNodeMail(user.email,user.name,"OTP for Email verification",otpEmailTemplate(user.name,otp))

    return sendMessage(res,"Email sent Successfully!")

    }catch(err){
    
        console.log(err.stack)

        return sendError(res,err)       
            
    }  
    
})

route.post('/forgotPassword',async (req,res)=>{
    try{
    req.body = filterNull(req.body)
    await EmailResendSchema(req.body);    
    
    const token = stringGen(10);

    const {url,user} = await ForgotPassword(filterNull({username:req.body.username,email:req.body.email}),token)

    await sendNodeMail(user.email,user.name,"Reset Password",resetPasswordTemplate(url))

    return sendMessage(res,url)

    }catch(err){
    
        console.log(err.stack)

        return sendError(res,err)       
            
    }  
    
})

route.post('/resetPassword',verifyGCaptcha,async (req,res)=>{
    try{
        req.body = filterNull(req.body)
    await ResetPasswordSchema(req.body); 
    
    await ResetPassword(req.body)
        
    return sendMessage(res,"Password Changed successfully!")

    }catch(err){
    
        console.log(err.stack)

        return sendError(res,err)       
            
    }  
    
})

module.exports = route;

