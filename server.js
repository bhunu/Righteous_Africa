import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'

const app = express()
app.use(cors())
app.use(express.json())

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

app.post('/api/contact', async (req, res) => {
  const { firstName, lastName, email, service, message } = req.body

  if (!firstName || !email || !message) {
    return res.status(400).json({ error: 'firstName, email and message are required.' })
  }

  try {
    await transporter.sendMail({
      from:    `"${firstName} ${lastName}" <${process.env.SMTP_USER}>`,
      to:      process.env.RECIPIENT_EMAIL,
      replyTo: email,
      subject: `RAE Enquiry${service ? ` — ${service}` : ''} from ${firstName} ${lastName}`,
      html: `
        <h2>New Enquiry from RAE Website</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${service ? `<p><strong>Service:</strong> ${service}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    })

    res.json({ success: true })
  } catch (err) {
    console.error('Mail error:', err)
    res.status(500).json({ error: 'Failed to send email. Please try again.' })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
