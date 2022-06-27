const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        min:3,
        max:255
    },
    username:{
        type:String,
        required:true,
        min:6,
        max:50,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        min:6,
        max:255,
        unique:true
    },
    password:{
        type:String,
        required:true,
        min:6,
        max:1024
    },
    date:{
        type:Date,
        default:Date.now
    },
    otp:{
        type:String,
        min:6
    },
    verified:{
        type:Boolean,
        default:false
    },
    resend:{
        type:Date
    },
    forgotToken:{
        type:String
    },
    tokenSend:{
        type:Date
    },
    ip:{
        type:String
    }
})

module.exports = mongoose.model('User',userSchema);