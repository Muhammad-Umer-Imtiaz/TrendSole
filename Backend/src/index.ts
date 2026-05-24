import express from 'express'
import { fileURLToPath } from 'node:url'
import { dbConnection } from './config/dbConnect.js'
import userRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import feedbackRoutes from './routes/feedbackRoutes.js'
import { analyticsRouter, dashboardRouter } from './routes/dashboardRoutes.js'
import { globalErrorHandler } from './middleware/globalErrorHandler.js'

const app = express()

const Port = process.env.PORT ?? 3000
const frontendUrl = process.env.FRONTEND_URL
const currentFilePath = fileURLToPath(import.meta.url)
const isDirectRun = process.argv[1] === currentFilePath

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use((req,res,next)=>{
    const requestOrigin = req.headers.origin

    if (requestOrigin && requestOrigin === frontendUrl) {
        res.header("Access-Control-Allow-Origin", requestOrigin)
    }

    res.header("Vary", "Origin")
    res.header("Access-Control-Allow-Credentials", "true")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")

    if (req.method === "OPTIONS") {
        return res.sendStatus(204)
    }

    next()
})

void dbConnection()

app.get('/',(req,res)=>{
  res.json({ message: "Backend running" });
})

app.use('/api/v1/users',userRoutes)
app.use('/api/v1/products',productRoutes)
app.use('/api/v1/categories',categoryRoutes)
app.use('/api/v1/orders',orderRoutes)
app.use('/api/v1/feedback',feedbackRoutes)
app.use('/api/v1/dashboard',dashboardRouter)
app.use('/api/v1/analytics',analyticsRouter)

app.use(globalErrorHandler);

export default app

if (isDirectRun) {
    app.listen(Port,()=>{
        console.log(`Server is running on port ${Port}`)
    })
}
