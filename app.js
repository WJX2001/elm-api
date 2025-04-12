
import cookieParser from 'cookie-parser'
import express from 'express'
import router from './routes/index.js'
import chalk from 'chalk';
import logger from 'morgan'
import config from 'config-lite';
import db from './mongodb/db.js';
import session from 'express-session';
const app = express()

app.all('*', (req, res, next) => {
  const { origin, Origin, referer, Referer } = req.headers
  const allowOrigin = origin || Origin || referer || Referer || '*'
  res.header("Access-Control-Allow-Origin", allowOrigin)
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
  res.header("Access-Control-Allow-Credentials", true) //可以带cookies
  res.header("X-Powered-By", 'Express')
  if (req.method == 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(logger('dev'))

app.use(session({
  name: config.session.name,
	secret: config.session.secret,
	resave: true,
	saveUninitialized: false,
	cookie: config.session.cookie,
	// store: new MongoStore({
  // 	url: config.url
	// })
}))

// 封装路由文件
router(app)

app.listen(config.port, () => {
  console.log(
    chalk.green(`成功监听端口：${config.port}`)
  )
})



module.exports = app
