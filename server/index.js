import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.join(__dirname, '..', 'uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 25 * 1024 * 1024, files: 10 },
})

app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || true }))
app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(uploadsDir))

const adminOnly = (req, res, next) => {
  if (!process.env.ADMIN_API_KEY || req.header('x-admin-key') !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  next()
}

async function makeCode() {
  for (let i = 0; i < 10; i += 1) {
    const n = crypto.randomInt(1, 99999).toString().padStart(5, '0')
    const code = `HH26-${n}`
    const found = await prisma.submission.findUnique({ where: { code } })
    if (!found) return code
  }
  return `HH26-${Date.now().toString().slice(-5)}`
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'halo-hola-api' }))

app.get('/api/places', async (_req, res, next) => {
  try {
    res.json(await prisma.place.findMany({ where: { published: true }, orderBy: { name: 'asc' } }))
  } catch (error) { next(error) }
})

app.get('/api/tours', async (_req, res, next) => {
  try {
    res.json(await prisma.tour.findMany({ orderBy: { number: 'asc' } }))
  } catch (error) { next(error) }
})

app.get('/api/stories', async (_req, res, next) => {
  try {
    res.json(await prisma.story.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } }))
  } catch (error) { next(error) }
})

app.post('/api/submissions', upload.array('files', 10), async (req, res, next) => {
  try {
    const required = ['name', 'email', 'type', 'theme', 'location', 'story']
    for (const key of required) {
      if (!req.body[key]?.trim()) return res.status(400).json({ message: `Thiếu trường ${key}` })
    }
    const code = await makeCode()
    const created = await prisma.submission.create({
      data: {
        code,
        name: req.body.name.trim(),
        displayName: req.body.displayName?.trim() || null,
        email: req.body.email.trim().toLowerCase(),
        phone: req.body.phone?.trim() || null,
        bio: req.body.bio?.trim() || null,
        type: req.body.type,
        theme: req.body.theme,
        color: req.body.color || null,
        location: req.body.location,
        story: req.body.story.trim(),
        allowMediaUse: req.body.allowMediaUse !== 'false',
        allowNewsletter: req.body.allowNewsletter === 'true',
        media: {
          create: (req.files || []).map(file => ({
            url: `/uploads/${file.filename}`,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
          })),
        },
      },
      include: { media: true },
    })
    res.status(201).json(created)
  } catch (error) { next(error) }
})

app.get('/api/admin/submissions', adminOnly, async (req, res, next) => {
  try {
    const status = req.query.status
    res.json(await prisma.submission.findMany({
      where: status ? { status } : undefined,
      include: { media: true },
      orderBy: { createdAt: 'desc' },
    }))
  } catch (error) { next(error) }
})

app.patch('/api/admin/submissions/:id/status', adminOnly, async (req, res, next) => {
  try {
    const allowed = ['PENDING', 'VALID', 'SHORTLIST', 'TOP52', 'AWARDED', 'REJECTED']
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Trạng thái không hợp lệ' })
    res.json(await prisma.submission.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    }))
  } catch (error) { next(error) }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  if (error instanceof multer.MulterError) return res.status(400).json({ message: error.message })
  res.status(500).json({ message: 'Có lỗi xảy ra trên máy chủ' })
})

const port = Number(process.env.PORT || 4000)
app.listen(port, () => console.log(`HALO HOLA API listening on :${port}`))
