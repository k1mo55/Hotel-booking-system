import { validateRegister } from './../middleware/validation';
import express from 'express'
import userController from '../controllers/userController'



const router = express.Router()

router.post("/register", validateRegister ,userController.register)

export default router