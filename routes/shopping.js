import express from 'express'
import Shop from '../controller/shopping/shop'
import Category from '../controller/shopping/category'
const router = express.Router()

router.get('/restaurants', Shop.getRestaurants)
router.get('/v2/restaurant/category', Category.getCategories)
router.get('/v1/restaurants/delivery_modes', Category.getDelivery)

export default router