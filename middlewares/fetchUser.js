const jwt = require('jsonwebtoken');
const LiveTokens = require('../models/LiveTokens')

const fetchUserByAccessToken = async (req, res, next)=>{
    const token=req.get('accessToken');
    if(!token) return res.status(401).json({errors: "No token provided"});
    try {
        const decoded_payload=jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user=decoded_payload;
        next();
    } catch (error) {
        res.status(401).json({errors: "Invalid token"});
    }
}
const fetchUserByRefreshToken = async (req, res, next)=>{
    const token=req.cookies.refreshToken;
    if(!token) return res.status(401).json({errors: "No token provided"});
    try {
        const storedToken=await LiveTokens.findOne({token: token});
        if(!storedToken) return res.status(401).json({errors: "Invalid Token"});

        const decoded_payload=jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        req.user=decoded_payload;
        next();
    } catch (error) {
        res.status(401).json({errors: "Invalid token"});
    }
}

module.exports={
    fetchUserByAccessToken,
    fetchUserByRefreshToken
};