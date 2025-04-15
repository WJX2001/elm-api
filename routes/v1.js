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
router.post('/test', (req, res) => {
  const { username } = req.body
  console.log(username,'username')
  res.send('ok')
  // const form = new formidable.IncomingForm()
  // form.parse(req, async (err, fields, files) => {
  //   const { username } = fields
  //   console.log(username,'username')
  //   res.send('ok')
  // })

  // console.log(req)
 
})
// router.post('/addimg/:type')

export default router