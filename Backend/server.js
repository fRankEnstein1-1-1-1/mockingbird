const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')
const {connect} = require('./config/db')
const authroute = require("./routes/auth");
const folderroute = require("./routes/folder");
const noteroute = require("./routes/note")
dotenv.config();
connect();
const app = express();
app.use(cors())
app.use(express.json());
app.use("/api/auth",authroute);
app.use("/api/folder",folderroute)
app.use("/api/note",noteroute)
app.listen(5000,()=>{
    console.log("server is running");
})
