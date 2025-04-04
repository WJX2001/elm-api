
import cookieParser from 'cookie-parser'
import express from 'express';
import router from './routes/index.js';
var app = express();



app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 封装路由文件
router(app);

module.exports = app;
