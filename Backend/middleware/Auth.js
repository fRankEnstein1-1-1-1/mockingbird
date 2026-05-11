const jwt = require("jsonwebtoken");

const auth = (req,res,next) => {
    try{
        const authheader = req.header("authorization")
        {
            if(!authheader){
                return res.status(401).json({message:
                    "NO token provided !"
                })
            }
            const token = authheader.split(" ")[1]
            if(!token){
                return res.status(401).json({message:"invalid token"})
            }
            const decoded = jwt.verify(token , process.env.JWT_SECRET);
            req.user = decoded.userId;
            next();
        }
    }
    catch(error){
        return res.status(401).json({message:"Token is invalid"})
    }

}

module.exports = auth;