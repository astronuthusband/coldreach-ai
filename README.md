<p align="center">
  <img src="logo.png" alt="ColdReach AI Logo" width="120" />
</p>

<h1 align="center">ColdReach AI</h1>

<p align="center">
  Turn cold outreach into something that actually gets replies.
</p>

ColdReach AI is an AI-powered tool that generates **highly personalized cold emails** based on a company’s website and a target person’s profile — built to eliminate generic outreach and improve response rates.

**Live Demo:** https://coldreach-ai-eight.vercel.app/

---

## The Problem

Most cold emails fail because they’re:
- Generic  
- Obviously templated  
- Lacking real context  

People ignore them instantly.

---

## The Solution

ColdReach AI analyzes:
- A company’s website  
- A target person’s role or bio  

Then generates:
- Personalized cold emails  
- High-converting subject lines  
- Follow-up messages  
- A “cringe score” to filter out spammy messaging  

The result: outreach that actually feels human.

---

## Features

- AI-generated personalized cold emails (3 variations)  
- 5 subject line suggestions  
- 2 follow-up messages  
- Tone control (formal → bold)  
- “Cringe Score” system (detects generic/spammy language)  
- Clean, minimal UI built for speed and clarity  
- Copy-to-clipboard for quick use  

---

## Tech Stack

- Frontend: React  
- Styling: Tailwind CSS  
- Backend: API routes (serverless)  
- AI Model: Llama 3.3 via Groq  
- Deployment: Vercel  

---

## How It Works

1. Paste a company website URL  
2. Add a target person’s bio or description  
3. Select your tone  
4. Generate outreach instantly  

The system combines context + intent to produce emails that feel tailored — not mass-produced.

---

## Why I Built This

Cold outreach is still one of the most effective ways to generate opportunities — but most people do it badly.

I wanted to build a tool that:
- forces better quality messaging  
- reduces reliance on templates  
- blends **engineering + marketing thinking**  

---


## Getting Started (Local Development)

```bash
git clone https://github.com/yourusername/coldreach-ai.git
cd coldreach-ai
npm install
npm run dev
