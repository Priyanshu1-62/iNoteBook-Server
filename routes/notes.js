const express=require('express');
const mongoose = require('mongoose');
const router=express.Router();
const Notes = require('../models/Notes');
const {fetchUserByAccessToken, fetchUserByRefreshToken} = require('../middlewares/fetchUser');
const strToArr = require('../middlewares/strToArr');
const { body, validationResult } = require('express-validator');

//Read all notes using GET: /api/notes/readNotes
router.get('/readNotes',  fetchUserByAccessToken, async (req, res)=>{
    try {
        const userID=req.user.userID;
        const notes=await Notes.find({myUser: userID});
        return res.status(200).json({notes});
    } 
    catch (error) {
        res.status(500).json({errors: "Internal server error"});
    }
})

//Read a single note using GET: /api/notes/readANote/:id
router.get('/readANote/:id',  fetchUserByAccessToken, async (req, res)=>{
    try {
        const notesID=req.params.id;
        if (!notesID || !mongoose.Types.ObjectId.isValid(notesID)) return res.status(400).json({errors: "Invalid note ID"});
        let notes=await Notes.findById(notesID);

        if(!notes) return res.status(404).json({errors: "Note not found"});
        if(notes.myUser.toString() != req.user.userID) return res.status(403).json({errors: "Forbidden"});

        return res.status(200).json({notes});
    } 
    catch (error) {
        res.status(500).json({errors: "Internal server error"});
    }
})

//Add a new note using POST: /api/notes/addNotes
router.post('/addNotes',  fetchUserByAccessToken, strToArr, [
    body('title')
        .trim()
        .isString()
        .isLength({min: 3})
        .withMessage("Title must be a string at least 3 characters long")
        .bail(),
    body('description')
        .trim()
        .isString()
        .isLength({min: 3})
        .withMessage("Description must be a string at least 3 characters long")
        .bail(),
    body('tag')
        .isArray()
        .withMessage("Please enter a valid set of space separated tags")
        .bail()
        .custom((arr)=>{
            for(let i=0;i<arr.length;i++){
                if (typeof arr[i] !== "string"){
                    throw new Error("Each tag must be a string");
                }
                if(arr[i].length<3){
                    throw new Error("Each tag must be at least 3 characters long");
                }
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
        const { title, description, tag } = req.body;
        const notes=new Notes({
            myUser: req.user.userID,
            title,
            description,
            tag 
        })
        await notes.save();
        return res.status(201).json({notes});
    } 
    catch (error) {
        res.status(500).json({errors: "Internal server error"});
    }
})

//Updating an existing notes using PUT: /api/notes/updateNotes/:id
router.put('/updateNotes/:id',  fetchUserByAccessToken, strToArr, [
    body('title')
        .optional()
        .isString()
        .trim()
        .isLength({min: 3})
        .withMessage("Title must be a string with at least 3 characters.")
        .bail(),
    body('description')
        .optional()
        .isString()
        .trim()
        .isLength({min: 3})
        .withMessage("Description must be a string with at least 3 characters")
        .bail(),
    body('tag')
        .optional()
        .isArray()
        .withMessage("Please enter a valid set of space separated tags")
        .bail()
        .custom((arr)=>{
            for(let i=0;i<arr.length;i++){
                if (typeof arr[i] !== "string"){
                    throw new Error("Each tag must be a string");
                }
                if(arr[i].length<3){
                    throw new Error("Each tag must be at least 3 characters long");
                }
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
        const { title, description, tag } = req.body;
        const newNotes={};
        if(title != undefined) newNotes.title=title;
        if(description != undefined) newNotes.description=description;
        if(tag != undefined) newNotes.tag=tag;

        if (Object.keys(newNotes).length === 0) return res.status(400).json({ errors: "No valid fields provided for update." });

        const notesID=req.params.id;
        if (!notesID || !mongoose.Types.ObjectId.isValid(notesID)) return res.status(400).json({errors: "Invalid notes ID"});
        let notes=await Notes.findById(notesID);

        if(!notes) return res.status(404).json({errors: "Not found"});
        if(notes.myUser.toString() !== req.user.userID) return res.status(403).json({errors: "Forbidden"});

        notes=await Notes.findByIdAndUpdate(notesID, {$set: newNotes}, {new: true});
        return res.status(200).json({notes});
    } 
    catch (error) {
        res.status(500).json({errors: "Internal server error"});
    }
})

//Deleting an existing notes using DELETE: /api/notes/deleteNotes/:id
router.delete('/deleteNotes/:id',  fetchUserByAccessToken, async (req, res)=>{
    try {
        const notesID=req.params.id;
        if (!notesID || !mongoose.Types.ObjectId.isValid(notesID)) return res.status(400).json({errors: "Invalid notes ID"});
        let notes=await Notes.findById(notesID);

        if(!notes) return res.status(404).json({errors: "Not found"});
        if(notes.myUser.toString() != req.user.userID) return res.status(403).json({errors: "Forbidden"});

        notes=await Notes.findByIdAndDelete(notesID);
        return res.status(200).json({ message: "Deleted" });
    } 
    catch (error) {
        res.status(500).json({errors: "Internal server error"});
    }
})

module.exports=router