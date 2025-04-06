import express from 'express'
import CityHandle from '../controller/v1/cities'
const router = express.Router()


router.get('/pois/:geohash', CityHandle.pois)



export default router