import express from 'express'
import verifyToken from '../middleware/auth';
import bookingsController from '../controllers/bookingsController';

const router = express.Router()
router.get('/',verifyToken,bookingsController.getMyBookings)

export default router