import express from 'express';
import Shop from '../controller/shopping/shop'
const router = express.Router();

router.get('/restaurants',Shop.getRestaurants)



export default router;