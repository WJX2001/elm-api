'use strict'
import express from 'express'
import CityHandle from '../controller/v1/cities'
import SearchPlace from '../controller/v1/search'
import BaseComponent from '../prototype/baseComponent'
import Carts from '../controller/v1/carts'
import Captchas from '../controller/v1/captchas'
import Address from '../controller/v1/address'
import Order from '../controller/v1/order'
const baseHandle = new BaseComponent()
const router = express.Router()


router.get('/cities', CityHandle.getCity)
router.get('/cities/:id', CityHandle.getCityById)
router.get('/pois', SearchPlace.search)
router.post('/addimg/:type', baseHandle.uploadImg)
router.post('/carts/checkout', Carts.checkout)
router.post('/captchas', Captchas.getCaptchas)
router.post('/users/:user_id/addresses', Address.addAddress)
router.delete('/users/:user_id/addresses/:address_id', Address.deleteAddress)
router.post('/users/:user_id/carts/:cart_id/orders', Order.postOrder);


export default router