const mongoose = require("mongoose")

const NoteSchema = new mongoose.Schema({
    userId:{
         type:mongoose.Schema.Types.ObjectId,
                ref:"user",
                required:true
    },
    
    folderId:{
         type:mongoose.Schema.Types.ObjectId,
                ref:"folder",
                required:true
    },
    title:{
        type:String,
        required : true,
    },
    content:{
        text:{
            type:String,
            default:""
        },
        images: {
            type: [String],
            default: []
        },

        voiceNotes: {
            type: [String],
            default: []
        },

        annotations: {
            type: [Object],
            default: []
        }
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    updatedAt:{
        type:Date,
        default:Date.now,
    }

})
module.exports = mongoose.model("notes",NoteSchema)