const mongoose = require("mongoose");
const connect = async()=>{
    try{
        await mongoose.connect(process.env.MONGOURL);
        console.log("Connected to mongodb")
    }
    catch(error){
        console.log(`unable to connect ot mongo ${error}`)
    }
}
module.exports = {connect};