import express from 'express'
import Hongbao from '../controller/promotion/hongbao'
const router = express.Router()

router.get('/v2/users/:user_id/hongbaos', Hongbao.getHongbao)

export default router