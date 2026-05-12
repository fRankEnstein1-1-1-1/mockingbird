const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors')
const {connect} = require('./config/db')
const authroute = require("./routes/auth");
const folderroute = require("./routes/folder");
const noteroute = require("./routes/note")
const uploadroute = require('./routes/upload')

connect();
const app = express();
app.use(cors())
app.use(express.json());
app.use("/api/auth",authroute);
app.use("/api/folder",folderroute)
app.use("/api/note",noteroute)
app.use("/api/upload",uploadroute)
app.listen(5000,()=>{
    console.log("server is running");
})
