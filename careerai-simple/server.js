// server.js - CareerAI India Backend
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import Anthropic from '@anthropic-ai/sdk'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

// Serve frontend files from public folder
app.use(express.static(path.join(__dirname, 'public')))

// Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// Helper to call Claude
async function callClaude(userMessage, systemMessage = '') {
  const params = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: userMessage }]
  }
  if (systemMessage) params.system = systemMessage
  const res = await anthropic.messages.create(params)
  return res.content[0].text
}

// Helper to clean and parse JSON from Claude
function parseJSON(text) {
  const clean = text.replace(/```json/g, '').replace(/```/g, '').trim()
  return JSON.parse(clean)
}

// ── API Routes ────────────────────────────────────────────

// 1. Score Resume
app.post('/api/score', async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body
    const text = await callClaude(`
You are an expert Indian resume coach. Analyze this resume.
Resume: "${resumeText || 'Sample resume: B.Tech CSE 2023, CGPA 8.2, React Node.js skills'}"
Target Role: "${targetRole || 'Software Developer'}"

Return ONLY raw JSON no markdown:
{
  "overall": 74,
  "ats": 68,
  "recruiter": 80,
  "impact": 72,
  "sections": [
    {"name": "Contact Info", "score": 90},
    {"name": "Work Experience", "score": 75},
    {"name": "Skills", "score": 65},
    {"name": "Education", "score": 85},
    {"name": "Summary", "score": 60}
  ],
  "strength": "one key strength here",
  "fix": "one critical fix here",
  "atsWarn": "one ATS issue here",
  "indiaTip": "one India market tip here",
  "wins": ["quick win 1", "quick win 2", "quick win 3"]
}`)
    res.json(parseJSON(text))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// 2. Job Match
app.post('/api/match', async (req, res) => {
  try {
    const { jobDesc } = req.body
    const text = await callClaude(`
You are an Indian ATS specialist.
Job Description: "${jobDesc}"

Return ONLY raw JSON no markdown:
{
  "match": 72,
  "interview": 58,
  "salary": "₹12–18 LPA",
  "matched": ["React", "Node.js", "MongoDB"],
  "missing": ["System Design", "AWS", "Docker"],
  "tip": "one actionable tip to improve match"
}`)
    res.json(parseJSON(text))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// 3. Career Roadmap
app.post('/api/roadmap', async (req, res) => {
  try {
    const { goal, current, exp } = req.body
    const text = await callClaude(`
You are an Indian career coach.
Goal: "${goal}"
Current: "${current || 'Fresher'}"
Experience: ${exp || 0} years

Return ONLY raw JSON no markdown:
{
  "timeline": "6 months",
  "salary": "₹12–20 LPA",
  "steps": [
    {"period": "Month 1-2", "focus": "Core Skills", "action": "what to do", "resource": "course name"},
    {"period": "Month 3-4", "focus": "Projects", "action": "what to do", "resource": "course name"},
    {"period": "Month 5-6", "focus": "Job Hunt", "action": "what to do", "resource": "platform name"}
  ],
  "companies": ["TCS", "Infosys", "Wipro", "Zomato", "Razorpay"],
  "certs": ["AWS Cloud Practitioner", "Meta Front-End Developer"]
}`)
    res.json(parseJSON(text))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// 4. Interview Questions
app.post('/api/questions', async (req, res) => {
  try {
    const { role, level } = req.body
    const text = await callClaude(`
Generate 4 interview questions for "${role}" at ${level || 'fresher'} level in India.
Return ONLY raw JSON array no markdown:
[
  {"id":1,"type":"Technical","q":"question here","hint":"key point"},
  {"id":2,"type":"HR","q":"question here","hint":"key point"},
  {"id":3,"type":"Technical","q":"question here","hint":"key point"},
  {"id":4,"type":"Behavioral","q":"question here","hint":"use STAR format"}
]`)
    res.json(parseJSON(text))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// 5. Grade Answer
app.post('/api/grade', async (req, res) => {
  try {
    const { question, answer } = req.body
    const text = await callClaude(`
Grade this interview answer as an Indian coach.
Q: "${question}"
A: "${answer}"
Return ONLY raw JSON no markdown:
{"score": 7, "feedback": "2 sentence feedback", "tip": "one improvement tip"}`)
    res.json(parseJSON(text))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// 6. AI Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body
    const reply = await callClaude(
      message,
      `You are CareerAI, an expert Indian career mentor. 
      Specialise in Indian IT jobs, campus placements, salary in LPA, 
      Indian companies like TCS Infosys Zomato Razorpay. 
      Be warm, concise, practical. Max 4 sentences.`
    )
    res.json({ reply })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`\n✅ CareerAI India running at: http://localhost:${PORT}`)
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_key_here') {
    console.log('⚠️  Add your API key in the .env file!')
    console.log('   Get it free at: https://console.anthropic.com\n')
  } else {
    console.log('✅ API key found. All AI features active!\n')
  }
})
