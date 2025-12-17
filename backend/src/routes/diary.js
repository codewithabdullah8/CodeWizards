
const express=require('express');const Diary=require('../models/Diary');const auth=require('../middleware/auth');
const router=express.Router();
router.get('/',auth,async(req,res)=>{const entries=await Diary.find({userId:req.user.id}).sort({createdAt:-1});res.json(entries);});
router.post('/',auth,async(req,res)=>{const {title,content,musicKey}=req.body;const entry=await Diary.create({userId:req.user.id,title,content,musicKey:musicKey||'none'});res.json(entry);});
router.get('/:id',auth,async(req,res)=>{const entry=await Diary.findOne({_id:req.params.id,userId:req.user.id});if(!entry)return res.status(404).json({message:'Not found'});res.json(entry);});
router.put('/:id',auth,async(req,res)=>{const updated=await Diary.findOneAndUpdate({_id:req.params.id,userId:req.user.id},req.body,{new:true});if(!updated)return res.status(404).json({message:'Not found'});res.json(updated);});
router.delete('/:id',auth,async(req,res)=>{const removed=await Diary.findOneAndDelete({_id:req.params.id,userId:req.user.id});if(!removed)return res.status(404).json({message:'Not found'});res.json({message:'Deleted'});});
module.exports=router;