const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    name:{
        type:String,
        trim:true,
        required:true,
    },
    parentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"folder",
        default:null,
    },
      path: {
        type: String,
        default: "/",
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
})
module.exports = mongoose.model("folder",folderSchema)