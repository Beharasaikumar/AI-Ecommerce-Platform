import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import router from './routes'
import { errorHandler, notFound } from '../../shared/middleware'

dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 3005

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
    }))
app.use(express.json())
app.use(router)

app.get("/", (req, res) => {
  res.send("Auth Service is running 🚀");
});

app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`\n🔐 Auth Service running on http://localhost:${PORT}`)
    console.log(`   POST /api/auth/register`)
    console.log(`   POST /api/auth/login`)
    console.log(`   GET  /api/auth/me`)
    console.log(`   POST /api/auth/logout\n`)
})