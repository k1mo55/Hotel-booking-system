import express from 'express'
import hotelsController from '../controllers/hotelsController'
import { body, validationResult ,param} from "express-validator";
import verifyToken from '../middleware/auth';
import bookingsController from '../controllers/bookingsController';


const router = express.Router()


router.get('/search', hotelsController.searchController)
router.get('/:id',
    param("id")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("hotel param must be a valid string"),
    hotelsController.getHotelDetails)

router.post("/:hotelId/bookings/payment-intent", 
    verifyToken,
    hotelsController.stripepayment
)

router.post("/:hotelId/bookings",verifyToken,hotelsController.bookings)

router.get('/',hotelsController.getAllHotels)
export default router