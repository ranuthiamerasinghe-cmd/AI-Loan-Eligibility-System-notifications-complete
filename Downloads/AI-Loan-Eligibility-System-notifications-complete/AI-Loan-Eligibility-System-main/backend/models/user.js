const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },


    email:{
        type:String,
        required:true,
        unique:true
    },

    phoneNumber:{ type:String },
    nationalId:{ type:String },
    dateOfBirth:{ type:Date },
    gender:{ type:String },
    address:{ type:String },
    employmentStatus:{ type:String },
    monthlyIncome:{ type:Number },
    accountStatus:{ type:String, default:"Verified" },


    password:{
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
    }


},
{
    timestamps:true
});


module.exports = mongoose.model("User", userSchema);