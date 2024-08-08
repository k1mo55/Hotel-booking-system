import { validateLogin } from '../middleware/validation';
import express,{ Request , Response } from 'express'
import userController from '../controllers/userController'
import  verifyToken   from '../middleware/auth'
const router = express.Router();

router.post("/login",validateLogin,userController.loginController)
router.get("/validate-token", verifyToken, (req: Request, res: Response) => {
    res.status(200).send({ userId: req.userId });
  });


export default router