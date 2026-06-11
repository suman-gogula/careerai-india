import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import Anthropic from '@anthropic-ai/sdk'

dotenv.config()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function callClaude(msg) {
  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: msg }]
  })
  return res.content[0].text
}

function parseJSON(text) {
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}

app.post('/api/score', async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body
    const text = await callClaude(`Analyze this resume for Indian job market. Resume: "${resumeText || 'Sample resume'}" Role: "${targetRole || 'Developer'}". Return ONLY raw JSON: {"overall":74,"ats":68,"recruiter":80,"impact":72,"sections":[{"name":"Contact Info","score":90},{"name":"Work Experience","score":75},{"name":"Skills","score":65},{"name":"Education","score":85},{"name":"Summary","score":60}],"strength":"Good technical skills","fix":"Add quantified achievements","atsWarn":"Missing keywords: REST API, Agile","indiaTip":"Add CGPA if above 7.5","wins":["Add professional summary","Quantify bullet points","Add GitHub URL"]}`)
    res.json(parseJSON(text))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/match', async (req, res) => {
  try {
    const { jobDesc } = req.body
    const text = await callClaude(`Analyze job description for Indian market: "${jobDesc}". Return ONLY raw JSON: {"match":72,"interview":58,"salary":"₹12-18 LPA","matched":["React","Node.js","MongoDB"],"missing":["System Design","AWS","Docker"],"tip":"Add System Design project to GitHub"}`)
    res.json(parseJSON(text))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/roadmap', async (req, res) => {
  try {
    const { goal, current } = req.body
    const text = await callClaude(`Create career roadmap for Indian professional. Goal: "${goal}" Current: "${current || 'Fresher'}". Return ONLY raw JSON: {"timeline":"6 months","salary":"₹12-20 LPA","steps":[{"period":"Month 1-2","focus":"Core Skills","action":"Learn DSA on LeetCode","resource":"Striver DSA Sheet"},{"period":"Month 3-4","focus":"Projects","action":"Build 2 full-stack projects","resource":"freeCodeCamp"},{"period":"Month 5-6","focus":"Job Hunt","action":"Apply 20 companies per week","resource":"Naukri + LinkedIn"}],"companies":["TCS","Infosys","Wipro","Zomato","Razorpay"],"certs":["AWS Cloud Practitioner","Meta Front-End Developer"]}`)
    res.json(parseJSON(text))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/questions', async (req, res) => {
  try {
    const { role, level } = req.body
    const text = await callClaude(`Generate 4 interview questions for "${role}" ${level} level in India. Return ONLY raw JSON array: [{"id":1,"type":"Technical","q":"Explain REST API","hint":"Cover HTTP methods"},{"id":2,"type":"HR","q":"Tell me about yourself","hint":"Keep it under 2 minutes"},{"id":3,"type":"Technical","q":"What is system design","hint":"Cover scalability"},{"id":4,"type":"Behavioral","q":"Describe a challenge you solved","hint":"Use STAR format"}]`)
    res.json(parseJSON(text))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/grade', async (req, res) => {
  try {
    const { question, answer } = req.body
    const text = await callClaude(`Grade this interview answer. Q: "${question}" A: "${answer}". Return ONLY raw JSON: {"score":7,"feedback":"Good answer but needs more specifics","tip":"Add a concrete example with numbers"}`)
    res.json(parseJSON(text))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body
    const anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const response = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: 'You are CareerAI, expert Indian career mentor. Specialise in Indian IT jobs, salary in LPA, companies like TCS Infosys Zomato. Be warm and concise.',
      messages: [{ role: 'user', content: message }]
    })
    res.json({ reply: response.content[0].text })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(3000, () => {
  console.log('✅ CareerAI India running at: http://localhost:3000')
  console.log(process.env.ANTHROPIC_API_KEY ? '✅ API Key found!' : '⚠️ Add API key in .env file!')
})s