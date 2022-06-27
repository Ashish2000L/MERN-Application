const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const cryptojs = require("crypto-js");

const {VerificationError, EmailSendError,ProxyUseError} = require('../lib/exception');
const {headers} = require("../lib/constants")
const User = require('../model/User');
const {ResponseBuilder} = require('../lib/response');

const fetch = require("node-fetch");


//verify if fields are unique in mongo
const checkUnique = async(fields)=>{
    for( const [k,value] of Object.entries(fields)){
        const find = Object();
        find[k] = value;
        console.log(find)
        if(await User.findOne(find)){
            throw new VerificationError(`${k} already exists!`,400,'userExist');
        }
    }
}

//encrypt using bcrypt
const bCryptEncrypt = async (value)=>{
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(value,salt);
    return hash;
}

// Base 64 Enc
const base64Enc = (text)=>{
    return cryptojs.enc.Base64.stringify(cryptojs.enc.Utf8.parse(text));
}

//AES encryption
const aesEncrypt = (data)=>{
    return cryptojs.AES.encrypt(data,process.env.AES_SECRET).toString()
}

//AES Decryption
const aesDecrypt=(data)=>{
    const bytes= cryptojs.AES.decrypt(data,process.env.AES_SECRET);
    return bytes.toString(cryptojs.enc.Utf8);
}

//SHA1 hash
const hashSHA1 = (data)=>{
    return cryptojs.enc.Hex.stringify(cryptojs.SHA1(data));
}

//Filter null or undefined key/value pair from object
const filterNull=(objectValue)=>{
    return Object.entries(objectValue).reduce((a,[k,v]) => (v == null ? a : (a[k]=v, a)), {})
}

//To generate error response
const sendError = (res,err)=>{
    return res.header(headers()).status(typeof(err.getStatus) === 'function' ? err.getStatus() : 500).send(new ResponseBuilder().err(typeof(err.getMessage) === 'function'? err.getMessage() : "An Error occured!",typeof(err.getStatus)==='function'? err.getStatus() : 500,typeof(err.getStatusCode)==='function'? err.getStatusCode() : 'error').toJSON());
}

//to send positive response
const sendMessage = (res,message=null,data=null,header=null)=>{
    return res.status(200).header(Object.assign(headers(),header)).send(new ResponseBuilder(data).setMessage(message||"success").setStatus(200).toJSON());
}

//To generate the random string 
const stringGen=(len)=>{
    var text = "";
    
    var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    for (var i = 0; i < len; i++)
      text += charset.charAt(Math.floor(Math.random() * charset.length));
    
    return text;
  }

//parse Cookies from the request
const parseCookies =(request)=>{
    const list = {};
    const cookieHeader = request.headers?.cookies;
    if (!cookieHeader) return list;

    cookieHeader.split(`;`).forEach(function(cookie) {
        let [ name, ...rest] = cookie.split(`=`);
        name = name?.trim();
        if (!name) return;
        const value = rest.join(`=`).trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });

    return list;
}


//verify password in token
const verifyToken=async (id,token)=>{

    bcryptCipher=aesDecrypt(token);
    const storedPassword = await User.findOne({id:id})
    const verify=await bcrypt.compare(bcryptCipher,storedPassword.password)
    if(!verify)
        throw new VerificationError("User not found, Login again",401,'invalidUser')

    if(!storedPassword.verified)
        throw new VerificationError("Email not verified",401,"EmailUnverified");
    
}

//verify Email
const verifyEmail = async (userUsername,otp)=>{
    const user = await User.findOne(userUsername)
    if(!user)
        throw new VerificationError("User not found",401,'userNotFound')

    if(base64Enc(otp)!== user.otp)
        throw new VerificationError("OTP is Incorrect",401,'InvalidOtp')
    
    await User.updateOne(userUsername,{$set:{verified:true},$unset:{otp:user.otp,resend:user.resend}})
    
}

// Resend email 
const resendEmail = async(userUsername,otp) =>{

    const user = await User.findOne(userUsername)

    if(!user)
        throw new VerificationError("User not found",401,'userNotFound')
    
    if(user.verified)
        throw new EmailSendError("User is already verified",422,'userVerified')

    if(user.resend && (new Date() -new Date(user.resend))<300000)
        throw new EmailSendError(`Limit exceeded! Please wait for ${Math.floor((300000-(new Date() -new Date(user.resend))) / 60000)? `${Math.floor((300000-(new Date() -new Date(user.resend))) / 60000)} min`:`${Math.floor((300000-((new Date() -new Date(user.resend))) % 60000) / 1000)} sec`}`,429,'emailLimitExceed')

    await User.updateOne(userUsername,{$set:{resend:new Date(),otp:base64Enc(otp)}})
    return user
    

}

// forgot password
const ForgotPassword = async(userUsername,token)=>{
    const user = await User.findOne(userUsername)

    if(!user)
        throw new VerificationError("User not found",401,'userNotFound')

    if(user.tokenSend && (new Date() -new Date(user.tokenSend))<300000)
        throw new EmailSendError(`Limit exceeded! Please wait for ${Math.floor((300000-(new Date() -new Date(user.tokenSend))) / 60000)? `${Math.floor((300000-(new Date() -new Date(user.tokenSend)))/ 60000)} min`:`${Math.floor((300000-(new Date() -new Date(user.tokenSend)) % 60000) / 1000)} sec`}`,429,'emailLimitExceed')

    const date = new Date()
    await User.updateOne(userUsername,{$set:{forgotToken:token,tokenSend:date}})
    
    const url = `https://growthingly.netlify.app/reset-password/${token}?${new URLSearchParams({uid:await base64Enc(user.id),e:base64Enc(new Date().setMilliseconds(3.6e+6))}).toString()}`
    return { url,user}
}

// Reset password
const ResetPassword = async(body)=>{

    const user = await User.findOne({token:body.token});

    if(!user)
        throw new VerificationError("User not found",401,'userNotFound')

    if(body.uid !== base64Enc(user._id))
        throw new VerificationError("Invalid User Found",401,'InvalidUser')

    let date = new Date(user.tokenSend)

    if(base64Enc(date.setMilliseconds(3.6e+6))!== body.e)
        throw new VerificationError("Invalid reset key found",401,'InvalidResetKey')

    if((new Date()-date)>3.6e+6)
        {
            await User.updateOne({_id:user._id},{$unset:{forgotToken:"",tokenSend:""}})
            throw new VerificationError("Reset Token expired, Generate new token!",401,'TokenExpired')
        }

    await User.updateOne({_id:user._id},{$set:{password:await bCryptEncrypt(body.newPassword)},$unset:{forgotToken:"",tokenSend:""}})

}

//JWT token 
const createJWT = async(req,userUsername,userPassword)=>{
    const user = await User.findOne(userUsername)
    var newLocation = false;
    var location = null;
    var uip=req.ip.toString().split(":")[0];
    var time = null

    var validRex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    
    if(!user)
        throw new VerificationError("User not found, try Signup",401,'userNotFound')

    if(!user.verified)
        throw new VerificationError("Email not verified",401,"EmailUnverified");
    
    const checkPass = await bcrypt.compare(userPassword,user.password);

    if(!checkPass)
        throw new VerificationError("Invalid Username or Password",401,'invalidUserPass')

    var value = await fetch("http://ip-api.com/json/"+uip+"?fields=17035227")
    
    if(value.ok & validRex.test(uip)){
        value = await value.json()

        uip = value.query;

        if(value.proxy)
            throw new ProxyUseError("Proxy use detected!",403,"ProxyUser");

        if(value.hosting)
            throw new ProxyUseError("Forbidden!",403,"HostForbidden");

        if(user.ip)
        {
            if(user.ip !== parseCookies(req).userAddr | user.ip !== hashSHA1(uip)){

                await User.updateOne(userUsername,{$set:{ip:hashSHA1(uip)}})

                newLocation=true;
                location = value.regionName+", "+value.city+", "+value.country;
             
                time = new Date().toLocaleString("en-US",{timeZone: value.timezone})
                
            }
        }else{
            await User.updateOne(userUsername,{$set:{ip:hashSHA1(uip)}})
        }
    }

    const jwt_token = jwt.sign({id:user._id,token:aesEncrypt(userPassword)},process.env.TOKEN_SECRET,{
        expiresIn:process.env.TOKEN_EXPIREIN
    });

    return {jwt_token,newLocation,location,uip,time,user}
}

// verify cookies middleware
const verifyCookies = async(req,res,next)=>{
    const cookies = parseCookies(req)
    if(Object.keys(cookies).length==0){
        return res.status(400).send(new ResponseBuilder().err("Bad Request",400,"BadRequest").toJSON())
    }else if(!Object.keys(cookies).includes("userAddr")){
        return res.status(400).send(new ResponseBuilder().err("Bad Request",400,"BadRequest").toJSON())
    }
    next();
}

// verify GCaptcha middleware
const verifyGCaptcha = async(req,res,next)=>{
    try{
    if(req.body.gRecaptchaResponse){
        var VERIFY_URL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.G_CAPTCHA_V3}&response=${req.body['gRecaptchaResponse']}&remoteip=${req.ip}`;

        fetch(VERIFY_URL, { method: 'POST' }).then(
            async response => {
                data = await response.json();
                if(!response.ok){
                    return res.status(response.status).send(new ResponseBuilder().err("Captcha Verification Failed!",response.status,data['error-codes'][0]).toJSON())
                }else{
                    if(!data.success)
                        return res.status(403).send(new ResponseBuilder().err("Captcha Verification Failed!",403,data['error-codes'][0]).toJSON())

                    delete req.body.gRecaptchaResponse

                    next()
                }

            }
        ).catch(err=>{
            res.status(403).send(new ResponseBuilder().err("Captcha Verification Failed!",403,'CaptchaVerifyFail').toJSON())
            console.log("error in captcha "+err)
            return;
        });
        
    }else{
        return res.status(400).send(new ResponseBuilder().err("G-Captcha not found",400,"CaptchaNotFound").toJSON())
    }
    }catch(err){
        console.log(err.stack)
        return res.status(500).send(new ResponseBuilder().err("Internal Server Error",500,data['error-codes'][0]).toJSON())
    }
}

//verify JWT token
const verifyJWT = async (req,res,next)=>{
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        const token= req.headers.authorization.split(' ')[1];

        try{
            const verify = jwt.verify(token,process.env.TOKEN_SECRET)
            
            await verifyToken(verify.id,verify.token)
            req.user = verify

            next();
        }catch(err){
            console.log(err.stack)

            if(err instanceof VerificationError)
                return res.status(err.getStatus()).send(new ResponseBuilder().err(err.getMessage(),err.getStatus(),err.getStatusCode()).toJSON())
            
            if(err instanceof jwt.TokenExpiredError)
                return res.status(401).send(new ResponseBuilder().err("JWT Token expired",401,'tokenExpire').toJSON())

            return res.status(401).send(new ResponseBuilder().err("Access Denied! Invalid Token",403,'invalidToken').toJSON())
        }
    }else{
        res.status(401).send(new ResponseBuilder().err("Access Denied! Token not found",403,'tokenNotFound').toJSON())
    }

}

module.exports = {checkUnique, bCryptEncrypt,createJWT,verifyJWT,filterNull,sendError,sendMessage,stringGen,base64Enc, verifyEmail,resendEmail,
    ForgotPassword,ResetPassword,verifyGCaptcha,verifyCookies}