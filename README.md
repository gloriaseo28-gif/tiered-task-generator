# Tiered Task Generator

> An AI-powered differentiation tool for Australian K–10 teachers. Enter a lesson objective and class profile — receive three tiers of classroom-ready tasks in under 10 seconds.

**[Live Demo →](https://your-app.vercel.app)** &nbsp;·&nbsp; **[Product Requirements Document →](./PRD.md)**

---

## What it does

Australian teachers are legally required to differentiate instruction for every student, but generating tiered tasks takes 30–45 minutes per lesson. This tool reduces that to under 5 minutes.

**Input:**
- Lesson objective
- Year level + subject
- Class profile (student counts per group: Learning Support, Standard, Extension/G&T, EAL/D)

**Output:**
- Three tiers of specific, immediately usable tasks
- Scaffolds and support strategies for the Learning Support tier
- Higher-order challenges for the Extension/G&T tier
- All aligned to the Australian Curriculum (AC v9), in Australian English

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Vercel serverless function (Node.js) |
| AI model | Anthropic Claude API (`claude-sonnet-4-6`) |
| Usage logging | Zapier webhook → Google Sheets |
| Deployment | Vercel |

**Security note:** The Anthropic API key is held in a Vercel environment variable and accessed only through the serverless function — it is never exposed in the browser.

## Product documentation

This project was built as a portfolio piece demonstrating PM and AI product thinking alongside technical implementation. The full PRD covers:

- Problem statement and Jobs to Be Done
- User research basis (10+ years practitioner experience + peer validation)
- Stakeholder map
- Success metrics and North Star metric
- MVP scope and prioritisation rationale
- API integration decisions (model selection, token budget, prompt engineering as a product decision)
- Integration considerations (auth, data privacy, developer experience)
- Zapier webhook — framed as a product decision
- v2 roadmap tied to success metrics
- Lessons learned

→ [Read the full PRD](./PRD.md)

## Local development

1. Clone the repo
   ```bash
   git clone https://github.com/your-username/tiered-task-generator.git
   cd tiered-task-generator
   ```

2. Install Vercel CLI
   ```bash
   npm install -g vercel
   ```

3. Add your Anthropic API key
   ```bash
   cp .env.example .env
   # Open .env and replace the placeholder with your real key
   ```

4. Run locally
   ```bash
   vercel dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Deploy your own

1. Fork this repo
2. Go to [vercel.com](https://vercel.com) → New Project → import your fork
3. Add `ANTHROPIC_API_KEY` as an environment variable
4. Deploy

## About

Built by **Gloria Seo** — Sydney-based educator transitioning into AI Product Management and L&D roles.

Combines 10+ years of classroom experience in differentiated instruction and Gifted & Talented education with AI tooling, prompt engineering, and product thinking.

[LinkedIn](https://linkedin.com/in/your-profile)

---

*Built June 2026 · claude-sonnet-4-6 · Vercel · Zapier*
