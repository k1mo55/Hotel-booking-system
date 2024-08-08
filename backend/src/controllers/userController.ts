import  bcrypt  from 'bcryptjs';
import express, { Request , Response } from 'express' 
import User from '../models/user'
import jwt from "jsonwebtoken"

const register = async ( req:Request , res:Response )=>{
    try{
        let { email, firstName, lastName, password, confirmPassword } = req.body

        let user = await User.findOne({ email:email })
        if(user){
            return res.status(400).json( { message:"user already exists" } )
        }
        user = await new User(req.body)
        user.save();

        const token = jwt.sign(
            { userId:user.id}
            ,process.env.JWT_SECRET_KEY as string,
            { expiresIn:"1d" } 
        )
        res.cookie("auth_token",token, {
            httpOnly:true,
            secure:process.env.NODE_ENV ==="production",
            maxAge:86400000
        } )
        return res.sendStatus(200);
    }catch(err){
        res.status(501).json( { message:"server error" } )
    }





}
const loginController = async (req:Request , res:Response)=>{
    try{
        const { email, password  } = req.body;
        const user = await User.findOne( { email:email } )
        if(!user){
            return res.status(400).json({ message : "Invalid Credentials" })
        }
        
         const isMatch = await bcrypt.compare(password , user.password)
        if(!isMatch){
            return res.status(400).json({ message : "Invalid Credentials" })
        }
        
        const token = jwt.sign( {userId:user.id}, process.env.JWT_SECRET_KEY as string,
            { expiresIn:"1d"}
         )
         res.cookie("auth_token",token, {
            httpOnly:true,
            secure:process.env.NODE_ENV ==="production",
            maxAge:86400000
        } )
        res.status(200).json({ userId:user.id })
    }catch(err){
        return res.status(501).json( { messsage:"server error" } )

    }
}




export default {
    register,
    loginController

}