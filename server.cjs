const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const nodemailer = require('nodemailer')
const { join } = require('path')

try {
  require('dotenv').config({ path: join(__dirname, '.env') })
} catch {}

const app = express()

app.use(helmet())

const ALLOWED_ORIGINS = [
  'https://righteousafrica.com',
  'https://www.righteousafrica.com',
  ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:5173', 'http://localhost:5000'] : []),
]
app.use(cors({ origin: ALLOWED_ORIGINS }))

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
})

app.use(express.json({ limit: '16kb' }))
app.use(express.static(join(__dirname, 'dist')))

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

app.post('/api/contact', contactLimiter, async (req, res) => {
  const { firstName, lastName, email, phone, service, message } = req.body

  if (!firstName || !email || !message) {
    return res.status(400).json({ error: 'firstName, email and message are required.' })
  }

  if (
    typeof firstName !== 'string' || firstName.length > 100 ||
    typeof lastName  !== 'undefined' && (typeof lastName !== 'string' || lastName.length > 100) ||
    typeof email     !== 'string' || email.length     > 254  ||
    typeof message   !== 'string' || message.length   > 5000
  ) {
    return res.status(400).json({ error: 'Invalid input.' })
  }

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' })
  }

  const safeFirst   = escHtml(firstName.trim())
  const safeLast    = escHtml((lastName  || '').trim())
  const safeEmail   = escHtml(email.trim())
  const safePhone   = phone ? escHtml(String(phone).slice(0, 30)) : ''
  const safeService = service ? escHtml(String(service).slice(0, 200)) : ''
  const safeMsg     = escHtml(message.trim()).replace(/\n/g, '<br>')

  try {
    await transporter.sendMail({
      from:    `"RAE Website" <${process.env.SMTP_USER}>`,
      to:      process.env.RECIPIENT_EMAIL,
      replyTo: safeEmail,
      subject: `RAE Enquiry${safeService ? ` — ${safeService}` : ''} from ${safeFirst} ${safeLast}`,
      html: `
        <h2>New Enquiry from RAE Website</h2>
        <p><strong>Name:</strong> ${safeFirst} ${safeLast}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        ${safePhone   ? `<p><strong>Phone / WhatsApp:</strong> ${safePhone}</p>` : ''}
        ${safeService ? `<p><strong>Service:</strong> ${safeService}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${safeMsg}</p>
      `,
    })

    res.json({ success: true })
  } catch (err) {
    console.error('Mail error:', err)
    res.status(500).json({ error: 'Failed to send email. Please try again.' })
  }
})

app.get('/{*path}', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
