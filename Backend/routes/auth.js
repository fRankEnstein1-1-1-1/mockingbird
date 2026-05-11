const express = require("express");
const bcrypt = require("bcrypt");
const jwt= require("jsonwebtoken");
const user = require("../models/User")

const router = express.Router()

router.post("/signup",async (req,res)=>
{
    try{
    const {username,email,password} = req.body;
    const existing  =  await user.findOne({email});
    if(existing){
        return res.status(400).json({message:"User exists already !"})
    }
    const hashedpassword = await bcrypt.hash(password,10);
    const newUser = await user.create({
        username,
        email,
        password:hashedpassword,
    })

const token = jwt.sign(
    { userId: newUser._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
); 
res.status(201).json({
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });
}
catch(error){
    res.status(500).json({message:"cant sign in ",error:error.message})
}
}
)

router.post("/login",async (req,res)=>{
    try{
        const{email,password} = req.body;
        const isuser =  await user.findOne({email});
        if(!isuser){
           return res.status(401).json({message:"Invalid email or password"})
        }
        const ismatch = await bcrypt.compare(password,isuser.password);
        if(!ismatch){
           return  res.status(401).json({message:"unrecognized token"})
        }
        const token = jwt.sign(
    { userId: isuser._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
);
        res.status(200).json({
            token,
            user: {
                id: isuser._id,
                username: isuser.username,
                email: isuser.email
            }
        });

    }
    catch(error){
        res.status(500).json({message : error.message})
    }
}
)

module.exports = router;