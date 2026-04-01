import { Router, Request, Response } from 'express'
import { pool } from './db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '.env') })

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'secret'
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d'

router.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: 'name, email and password are required' })
        }

        const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email])
        if (exists.rows.length > 0) {
            return res.status(409).json({ success: false, error: 'Email already registered' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const userRole = role === 'admin' ? 'admin' : 'user'

        const result = await pool.query(
            `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at`,
            [name, email, hashedPassword, userRole]
        )
        const user = result.rows[0]
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES } as any
        )

        res.status(201).json({
            success: true,
            data: { user, token },
            message: 'Account created successfully'
        })
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message })
    }
})

router.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'email and password are required' })
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' })
        }

        const user = result.rows[0]
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' })
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES } as any
        )

        res.json({
            success: true,
            data: {
                user: { id: user.id, name: user.name, email: user.email, role: user.role },
                token
            },
            message: 'Login successful'
        })
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message })
    }
})

router.get('/api/auth/me', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'No token provided' })
        }
        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, JWT_SECRET) as any
        res.json({ success: true, data: decoded })
    } catch {
        res.status(401).json({ success: false, error: 'Invalid or expired token' })
    }
})

router.post('/api/auth/logout', (_req: Request, res: Response) => {
    res.json({ success: true, message: 'Logged out' })
})

export default router