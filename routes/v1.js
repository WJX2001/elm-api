'use strict'
import express from 'express'
import CityHandle from '../controller/v1/cities'
import SearchPlace from '../controller/v1/search'
import BaseComponent from '../prototype/baseComponent'
import Carts from '../controller/v1/carts'
import Captchas from '../controller/v1/captchas'
const baseHandle = new BaseComponent()
const router = express.Router()


router.get('/cities', CityHandle.getCity)
router.get('/cities/:id', CityHandle.getCityById)
router.get('/pois', SearchPlace.search)
router.post('/addimg/:type', baseHandle.uploadImg)
router.post('/carts/checkout', Carts.checkout)
router.post('/captchas', Captchas.getCaptchas);
router.post('/test', (req, res) => {
  console.log(req)
  res.send('ok')
})
// router.post('/addimg/:type')

export default router