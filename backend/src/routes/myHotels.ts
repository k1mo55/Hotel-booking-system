import express from "express"
import myHotelController from "../controllers/myHotelController"
import multer from "multer";
import verifyToken from "../middleware/auth";
import { validatehotel } from "../middleware/validation";
const storage = multer.memoryStorage();
const upload = multer({
    storage:storage,
    limits:{
        fileSize: 5*1024*1024  //5MB
    }
})


const router = express.Router()



router.post('/',
    verifyToken,
    validatehotel,
    upload.array("imageFiles",6),
    myHotelController.createHotel
)
router.get('/',verifyToken,myHotelController.getMyHotel)
router.get('/:id',verifyToken, myHotelController.getHotel)
router.put('/:hotelId',
    verifyToken,
    validatehotel,
    upload.array("imageFiles",6),
    myHotelController.updateMyHotel
)

export default router;