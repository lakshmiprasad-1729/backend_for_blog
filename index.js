import express from 'express'
import connectDB from './src/database/connectDB.js'
import cookieParser from 'cookie-parser';
import {userRouter,postRouter,likeRouter, commentRouter,subscriptionRouter} from './src/router/index.js'
import cors from 'cors'
import { createProxyMiddleware } from 'http-proxy-middleware';

const corsoptions ={
    origin: 'http://localhost:5000',
    credentials:true,
}

const app = express();
app.use(cors(corsoptions))
// app.use(createProxyMiddleware({
//     router: (req) => new URL(req.path.substring(1)),
//     pathRewrite: (path, req) => (new URL(req.path.substring(1))).pathname,
//     changeOrigin: true,
//     logger: console
//   }))
app.use(express.json({limit:"16kb"}))
app.use(express.static("public"))
app.use(express.json({limit:"16kb"}))
app.use(cookieParser())
app.use('/my-blog-api/account',userRouter);
app.use('/my-blog-api/post',postRouter);
app.use('/my-blog-api/like',likeRouter)
app.use('/my-blog-api/comment',commentRouter)
app.use('/my-blog-api/subscription',subscriptionRouter)


connectDB()
.then(()=>[
    app.listen(4000,()=>{
        console.log('db connected at 4000 port')
    })
])