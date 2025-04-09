import express from 'express'
import Shop from '../controller/shopping/shop'
import Category from '../controller/shopping/category'
const router = express.Router()

router.get('/v2/restaurant/category', Category.getCategories)
router.get('/v1/restaurants/delivery_modes', Category.getDelivery)
router.get('/v1/restaurants/activity_attributes', Category.getActivity);
router.get('/restaurants', Shop.getRestaurants)
router.get('/restaurant/:restaurant_id', Shop.getRestaurantDetail);
export default router