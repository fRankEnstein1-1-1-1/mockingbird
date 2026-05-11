const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
    {
        username : {
            type:String,
            required:true,
        },
        email : {
            type : String,
            required :true,
            trim:true,
            unique:true,
        },
        password:{
            required:true,
            type : String,
            minlength : 4,
        },
          createdAt: {
        type: Date,
        default: Date.now,
    },
    },
    {
    timestamps:true,
    }
)

module.exports = mongoose.model("user",UserSchema);