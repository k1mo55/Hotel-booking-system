import { Request, Response } from "express"
import Hotel from "../models/hotel"
import { BookingType, HotelSearchResponse } from "../shared/types";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_KEY as string)


const searchController = async ( req: Request , res:Response) =>{
    try{
        const query =constructSearchQuery(req.query)

        let sortOptions = { }

        switch(req.query.sortOption){
            case "starRating" : sortOptions= { starRating:-1 }; //sort by high to low
            break;
            case "pricePerNightAsc" : sortOptions = {pricePerNight:1}; //sort by low to high
            break;
            case "pricePerNightDesc":sortOptions = {pricePerNight:-1};       
            break;
        }


        const pageSize =5;
        const pageNumber = parseInt(req.query.page? req.query.page.toString() :"1" )
        const skip = (pageNumber -1) * pageSize  // if i am on page 3 skip the first 10 elemets (3-1) * 5 

        
        const hotels = await Hotel.find(query).sort(sortOptions).skip(skip).limit(pageSize);
        
        if(!hotels){
            return res.status(404).json( { message:"no hotels found" } )
        }
        const total = await Hotel.countDocuments(query);
        const response: HotelSearchResponse = {
            data:hotels,
            pagination : {
                total,
                page:pageNumber,
                pages:Math.ceil(total/pageSize)
            }
        }
        res.status(200).json(response);


    }catch(err){
        res.status(500).json( { message:"server error" } )
    }

}
const getHotelDetails = async (req:Request , res:Response)=>{
    try{
        const hotelId = req.params.id
        const hotel = await Hotel.findById(hotelId);
        if(!hotel){
            return res.status(404).json( { message:"hotel doesnt exist" } )
        }
        res.status(200).json(hotel);


    }catch(err){
        res.status(500).json( { messagee:"server error" } )
    }

}

const stripepayment = async (req:Request , res:Response)=>{
    try{
        const { numberOfNights } = req.body;
        const hotelId = req.params.hotelId;
    
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
          return res.status(400).json({ message: "Hotel not found" });
        }
    
        const totalCost = hotel.pricePerNight * numberOfNights;
    
        const paymentIntent = await stripe.paymentIntents.create({
          amount: totalCost * 100,
          currency: "gbp",
          metadata: {
            hotelId,
            userId: req.userId,
          },
        });
    
        if (!paymentIntent.client_secret) {
          return res.status(500).json({ message: "Error creating payment intent" });
        }
    
        const response = {
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret.toString(),
          totalCost,
        };
    
        res.send(response);


    }catch(err){
        res.status(500).json( { message:"server error" } )
    }
}


const bookings = async (req:Request , res:Response)=>{
    try {
        const paymentIntentId = req.body.paymentIntentId;
  
        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId as string
        );
  
        if (!paymentIntent) {
          return res.status(400).json({ message: "payment intent not found" });
        }
  
        if (
          paymentIntent.metadata.hotelId !== req.params.hotelId ||
          paymentIntent.metadata.userId !== req.userId
        ) {
          return res.status(400).json({ message: "payment intent mismatch" });
        }
  
        if (paymentIntent.status !== "succeeded") {
          return res.status(400).json({
            message: `payment intent not succeeded. Status: ${paymentIntent.status}`,
          });
        }
  
        const newBooking: BookingType = {
          ...req.body,
          userId: req.userId,
        };
  
        const hotel = await Hotel.findOneAndUpdate(
          { _id: req.params.hotelId },
          {
            $push: { bookings: newBooking },
          }
        );
  
        if (!hotel) {
          return res.status(400).json({ message: "hotel not found" });
        }
  
        await hotel.save();
        console.log(hotel)
        res.status(200).send();
      } catch (error) {
        res.status(500).json({ message: "something went wrong" });
      }
}

const getAllHotels = async(req:Request , res:Response)=>{
    try{
        const hotels = await Hotel.find().sort("-lastUpdate");
        if(!hotels){
            return res.status(404).json({ message:"couldnt find my hotel" })
        }
        res.status(200).json(hotels)
    }catch(err){
        res.status(500).json({ message:"server error" })
    }


}





const constructSearchQuery = (queryParams:any)=>{
        let constructedQuery:any = {  }

        // after if condition the object we arte going to search for on the mpngo data base is 
        // {
        //     $or: [{city: new RegExp(queryParams.destination,"i")  }, {country: new RegExp(queryParams.destination,"i")  }, ]
        // }
        // which will match any of the properties inside (Regexp makes the search case -insestive)
        if(queryParams.destination){
            constructedQuery.$or = [
                {city: new RegExp(queryParams.destination,"i")  },
                {country: new RegExp(queryParams.destination,"i")  },
            ];
        }
        if(queryParams.adultCount){
            constructedQuery.adultCount ={
                $gte:parseInt(queryParams.adultCount)  //gte greater than or equal 
            }
        }
        if(queryParams.childCount){
            constructedQuery.childCount ={
                $gte:parseInt(queryParams.childCount)  //gte greater than or equal 
            }
        }
        // constructedQuery :{
        //     facilities: $all:["wifi","pool"]
        // }


        if(queryParams.facilities){
            constructedQuery.facilities = {
                $all: Array.isArray(queryParams.facilities) ? queryParams.facilities: [queryParams.facilities]
            }
        }
        if(queryParams.types){
            constructedQuery.type ={
                $in:Array.isArray(queryParams.types)? queryParams.types:[queryParams.types]
            }
        }
        if(queryParams.stars){
            const starRatings = Array.isArray(queryParams.stars)
            ? queryParams.stars.map((star: string) => parseInt(star))
            : parseInt(queryParams.stars);
            constructedQuery.starRating ={ $in:starRatings }

        }
        if (queryParams.maxPrice) {
            constructedQuery.pricePerNight = {
            $lte: parseInt(queryParams.maxPrice).toString(),
            };
        }

        return constructedQuery;
}



export default {
    searchController,
    getHotelDetails,
    stripepayment,
    bookings,
    getAllHotels

}