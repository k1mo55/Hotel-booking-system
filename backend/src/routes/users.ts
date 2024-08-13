import { validateRegister } from './../middleware/validation';
import express from 'express'
import userController from '../controllers/userController'
import verifyToken from '../middleware/auth';



const router = express.Router()

router.post("/register", validateRegister ,userController.register)

router.get("/me",verifyToken,userController.getCurrentUser)
export default router