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
        return res.status(500).json( { message:"Server error" } )
    }
}

const getMyHotel  = async (req:Request , res:Response  )=>{
    try{   
        const myHotels= await Hotel.find( { userId:req.userId } );
        if(!myHotels){
            return res.status(404).json( { messsage:"couldnt find any hotel" } )
        }
        res.status(200).json(myHotels);
    }catch(err){
        res.status(500).json({ message:"server error" })
    }
}

const updateMyHotel  = async (req:Request , res:Response  )=>{
    try{    
        
        const updatedHotel:HotelType = req.body
        
        updatedHotel.lastUpdated = new Date();
        const hotel = await Hotel.findByIdAndUpdate({ _id:req.params.hotelId , userId:req.userId }, updatedHotel,{ new:true } )
       
        if(!hotel){
            return res.status(404).json( { messsage:"couldnt find the hotel" } )
        }
        const files = req.files as Express.Multer.File[];
        const updatedImageUrls = await uploadImages(files);  //function at the end
        
        hotel.imageUrls = [
            ...updatedImageUrls,
            ...(updatedHotel.imageUrls || []),
          ];
         await hotel.save(); 
          res.status(200).json(hotel)
    }
    catch(err){
        res.status(500).json({ message:"server error" })
    }
}

const getHotel  = async (req:Request , res:Response  )=>{
    try{    
        const id =req.params.id
        const hotel = await Hotel.findOne({   
            _id:id,
            userId:req.userId
        });

        if(!hotel){
            return res.status(404).json( { messsage:"couldnt find the hotel" } )
        }
        res.json(hotel);
    }
    catch(err){
        res.status(500).json({ message:"server error" })
    }
}

async function uploadImages(imageFiles: Express.Multer.File[]) {
    const uploadPromises = imageFiles.map(async (image) => {
      const b64 = Buffer.from(image.buffer).toString("base64");
      let dataURI = "data:" + image.mimetype + ";base64," + b64;
      const res = await cloudinary.v2.uploader.upload(dataURI);
      return res.url;
    });
  
    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
}






export default {
    createHotel,
    getMyHotel,
    updateMyHotel,
    getHotel
}