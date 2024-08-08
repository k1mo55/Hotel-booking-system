import { HotelType } from './../shared/types';
import { Request, Response } from "express"
import cloudinary from 'cloudinary'
import Hotel from '../models/hotel';
const createHotel = async ( req:Request, res:Response)=>{
    try{
        const imageFIiles = req.files as Express.Multer.File[]    
        const newHotel: HotelType = req.body;

        const uploadPromises = imageFIiles.map( async(image)=>{
            const b64 =Buffer.from(image.buffer).toString("base64")
            let dataURI = "data:"+image.mimetype+";base64,"+b64
            const res = await cloudinary.v2.uploader.upload(dataURI)
            return res.url 
        }) 
        const imageUrls = await Promise.all(uploadPromises)
        newHotel.imageUrls = imageUrls
        newHotel.lastUpdated = new Date();
        newHotel.userId =req.userId;
        const hotel = new Hotel(newHotel);
        await hotel.save();
        res.status(201).send(hotel);
    }catch(err){
        return res.status(501).json( { message:"Server error" } )
    }
}




export default {
    createHotel

}