const express=require('express');
const router=express.Router();
const User = require('../models/User');
const LiveTokens = require('../models/LiveTokens');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {fetchUserByAccessToken, fetchUserByRefreshToken} = require('../middlewares/fetchUser');

User.syncIndexes()
    .then(()=>{console.log("Synced with MongoDB")})
    .catch(()=>{console.log("Syncing with MongoDB unsuccessful")})

async function createAccessToken(id){
    const token=jwt.sign(
        {
            userID: id,
            role: 'user'
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: '15min'
        }
    )
    return token;
}
async function createRefreshToken(id){
    const token=jwt.sign(
        {
            userID: id
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: '15d'
        }
    )
    const liveToken=new LiveTokens({token});
    await liveToken.save();
    return token;
}
async function authenticatePassword(dbHash, passw){
    const ok=await bcrypt.compare(passw, dbHash);
    return ok;
}
//Creating a user using Post: /api/auth/createUser.
router.post('/createUser', [
    body('name')
        .trim()
        .isLength({min : 3})
        .withMessage("Username must be of atlest 3 characters")
        .bail(),
    body('email')
        .isEmail()
        .withMessage("Please enter a valid email")
        .bail()
        .custom( async (value)=>{
            const isDuplicate = await User.findOne({email: value});
            if(isDuplicate){
                throw new Error("A user with this email address already exists.");
            }
            return true;
        })
        .bail(),
    body('password')
        .isStrongPassword()
        .withMessage("Password must have at least 8 characters and include uppercase, lowercase, number, and symbol")
],
async (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()[0].msg});
    }
    try {
        const salt=await bcrypt.genSalt(10);
        const hash=await bcrypt.hash(req.body.password, salt);
        req.body.password=hash;

        const user=new User(req.body);
        await user.save();

        const accessToken=await createAccessToken(user._id);
        const refreshToken=await createRefreshToken(user._id);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            path: "/",
            maxAge: 15*24*60*60*1000
        });
        return res.status(201).json({
            user: {id: user._id, name: user.name},
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    } catch (error) {
        res.status(500).json({errors: "Internal Server Error"});
    }
})

//Authenticating a user using Post: /api/auth/login.
router.post('/login', [
    body('email')
        .isEmail()
        .withMessage("Please enter a valid email")
        .bail()
        .custom(async (value, {req})=>{
            const user=await User.findOne({email: value});
            if(!user){
                req.user={password: process.env.DUMMY_HASH}
                throw new Error("No user found with provided email address");
            }
            req.user=user;
            return true;
        })
        .bail(),
    body('password')
        .custom(async (value, {req})=>{
            const okay=await authenticatePassword(req.user.password, value);
            if(!okay){
                throw new Error("Invalid email or password");
            }
            return true;
        })
],
async (req, res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()[0].msg});
    }
    try {
        const accessToken=await createAccessToken(req.user._id);
        const refreshToken=await createRefreshToken(req.user._id);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            path: "/",
            maxAge: 15*24*60*60*1000
        });
        return res.status(200).json({
            user: {id: req.user._id, name: req.user.name},
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    }
    catch (error) {
        res.status(500).json({errors: "Internal Server Error"});
    }
})

//Get User using Post: /api/auth/getUser.
router.post('/getUser', fetchUserByAccessToken, async (req, res)=>{
    try {
        const userID=req.user.userID;
        const user=await User.findOne({_id: userID}, {password: 0});
        return res.status(200).json({user});
    } catch (error) {
        res.status(500).json({errors: "Internal server error"});
    }
})

//Refreshing access token using Post: /api/auth/refresh.
router.post('/refresh', fetchUserByRefreshToken, async (req, res)=>{
    try {
        const userID=req.user.userID;
        const accessToken=await createAccessToken(userID);
        return res.status(200).json({accessToken});
    }
    catch (error) {
        res.status(500).json({errors: "Internal server error"});
    }
})

//Logging out user using Post: /api/auth/logout.
router.post('/logout', fetchUserByRefreshToken, async (req, res)=>{
    try {
        const token=req.cookies.refreshToken;
        await LiveTokens.deleteOne({token: token});

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            path: "/"
        })

        res.status(200).json({message: "Logout successful"});
    } 
    catch (error) {
        res.status(500).json({errors: "Internal server error"});
    }
})

//Remembered user login using Post: /api/auth/rememberme.
router.post('/rememberme', fetchUserByRefreshToken, async (req, res)=>{
    try {
        const userID=req.user.userID;
        const accessToken=await createAccessToken(userID);
        const refreshToken=await createRefreshToken(userID);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            path: '/',
            maxAge: 15*24*60*60*1000
        })
        return res.status(201).json({
            user: {id: userID, name: req.user.name},
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    } 
    catch (error) {
        res.status(500).json({errors: "Internal server error"});
    }
})

module.exports=router