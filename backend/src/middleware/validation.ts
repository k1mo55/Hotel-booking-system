import { body , validationResult } from "express-validator"
import express, { Response , Request , NextFunction} from 'express'

const handleValidationErrors =async ( req:Request, res:Response , next: NextFunction)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log({errors:errors.array})
        return res.status(400).json({ errors:errors.array() })
    }
    next();

}



export const validateRegister = [
    body("firstName").isString().notEmpty().withMessage("Firstname is requird"),
    body("lastName").isString().notEmpty().withMessage("Lastname is required"),
    body("email").isString().notEmpty().withMessage("email is requird").isEmail(),
    body("password").isString().notEmpty().withMessage("password is required").isLength( { min:6 } ).withMessage("required atleast 6 chacracters"),
    handleValidationErrors
]


export const validateLogin = [
    body("email").isString().notEmpty().withMessage("email is required").isEmail(),
    body("password").isString().notEmpty().withMessage("password is required is required").isLength( { min:6 } ).withMessage("min 6 characters"),
    handleValidationErrors
]

export const validatehotel=[
    body("name").notEmpty().withMessage("name is required"),
    body("city").notEmpty().withMessage("city is required"),
    body("country").notEmpty().withMessage("country is required"),
    body("description").notEmpty().withMessage("description is required"),
    body("pricePerNight").notEmpty().isNumeric().withMessage("price per night and must be a number"),
    body("facility").notEmpty().isArray().withMessage("facilities are required"),
]