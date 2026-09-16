const mongoose = require("mongoose");


const pendingRegistrationSchema = new mongoose.Schema({

    requestId:{
        type:String,
        required:true
    },


    name:{
        type:String,
        required:true
    },


    email:{
        type:String,
        required:true
    },

    phoneNumber:{ type:String },
    nationalId:{ type:String },
    dateOfBirth:{ type:Date },
    gender:{ type:String },
    address:{ type:String },
    employmentStatus:{ type:String },
    monthlyIncome:{ type:Number },


    hashedPassword:{
        type:String,
        required:true
    },


    province:{
        type:String
    },


    district:{
        type:String
    },


    role:{
        type:String,
        default:"customer"
    },


    otp:{
        type:String,
        required:true
    },


    expiresAt:{
        type:Date,
        required:true
    }


});


module.exports = mongoose.model(
    "PendingRegistration",
    pendingRegistrationSchema
);