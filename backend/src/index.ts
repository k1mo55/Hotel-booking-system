import express, { Request ,Response }from 'express'
import cors from 'cors'
import "dotenv/config"
import userRoutes from './routes/users'
import mongoose from 'mongoose'
import authRoutes from './routes/auth'
import cookieParser from 'cookie-parser'
import {v2 as cloudinary } from 'cloudinary'
import myHotelRoutes from './routes/myHotels'
const app = express();
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded( {extended:true } ))
app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    })
  );

// app.get('/api/test', async (req: Request, res : Response ) =>{
//     res.send( { meessag:"hello from eexpreess" } )
    
// })
app.use("/api/auth",authRoutes)
app.use("/api/users",userRoutes)
app.use("/api/my-hotels",myHotelRoutes)

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string).then(()=>{
    app.listen(7000 ,()=>{
        console.log("server is running on 7000 and the database connctd")
    
    })
})

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SCECRET,
  secure: true,
});




