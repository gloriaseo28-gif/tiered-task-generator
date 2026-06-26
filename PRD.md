# Tiered Task Generator — Product Requirements Document

**Product:** Tiered Task Generator  
**Version:** 1.0 — MVP  
**Author:** Gloria Seo  
**Date:** June 2026  
**Status:** MVP Shipped  
**Live URL:** *(Vercel — add on deployment)*  
**Repo:** *(GitHub — add on deployment)*

---

## Executive Summary

**What it is:** A working, AI-powered web application that generates tiered differentiated learning tasks for K–10 teachers. The teacher inputs a lesson objective and class profile; the tool returns three tiers of classroom-ready tasks — Learning Support, Standard, and Extension/G&T — in under 10 seconds.

**The problem:** Differentiation is legally required in Australian classrooms but consistently one of the most time-consuming parts of lesson planning. Existing tools — generic AI chatbots, pre-authored curriculum platforms — do not account for a teacher's specific class profile or produce output aligned to the Australian Curriculum. This tool does.

**Built and shipped:** Working deployed application (React frontend + Vercel serverless function + Anthropic Claude API), Zapier webhook logging usage to Google Sheets, public GitHub repository with full PRD documentation.

**Key product decisions:**
- `claude-sonnet-4-6` selected over Haiku (insufficient pedagogical nuance) and Opus (unjustified cost/latency tradeoff for structured task generation)
- JSON schema enforcement in prompt — a reliability decision with direct UX impact; free-text output broke on edge cases
- Zapier over custom backend — stage-appropriate validation tool, not a production logging solution
- All class profile fields optional — discovered through user testing that teachers estimate rather than count

**North Star metric:** Return usage rate — target ≥ 50% of first-time users return within 2 weeks.

**Status:** MVP shipped. Two classroom teachers tested the tool pre-submission; output was rated "immediately usable without significant editing." v2 roadmap is scoped and prioritised but unbuilt.

| | |
|---|---|
| **Live URL** | *(add on Vercel deployment)* |
| **GitHub repo** | *(add on deployment)* |
| **Model** | claude-sonnet-4-6 |
| **Stack** | React · Vercel serverless · Anthropic API · Zapier · Google Sheets |

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [User Research](#2-user-research)
   - [2b. Stakeholder Map](#2b-stakeholder-map)
3. [Goals & Success Metrics](#3-goals--success-metrics)
   - [Adoption Considerations](#adoption-considerations)
4. [MVP Scope & Prioritisation](#4-mvp-scope--prioritisation)
   - [Known Risks — v1](#known-risks--v1)
5. [API Integration — Capabilities, Constraints & Product Decisions](#5-api-integration--capabilities-constraints--product-decisions)
6. [Integration Considerations](#6-integration-considerations)
7. [Zapier Webhook — A Product Decision](#7-zapier-webhook--a-product-decision)
8. [Architecture Overview](#8-architecture-overview)
9. [What's Next — v2 Roadmap](#9-whats-next--v2-roadmap)
10. [Lessons Learned](#10-lessons-learned)

---

## 1. Problem Statement

Australian teachers are legally and professionally required to differentiate instruction for every student in their class — adjusting content, process, and product to meet students at their current level of readiness. In practice, differentiation is one of the most time-intensive parts of lesson planning, particularly for classrooms managing a range of concurrent needs: students working below year level, students identified as gifted and talented (G&T), students from EAL/D backgrounds, and students on individual learning support plans.

Existing solutions fall into three categories, each with a meaningful gap:

**Generic AI chatbots (ChatGPT, Claude.ai):** Capable of generating tasks, but require the teacher to already know how to prompt effectively and still produce generic outputs that don't account for a specific class profile or Australian Curriculum alignment. The teacher does the differentiation thinking; the AI just writes faster.

**Curriculum platforms (Education Perfect, Mathspace):** Built around pre-authored resources, not responsive generation. A teacher cannot input their lesson objective and receive tiered tasks for their specific class in real time.

**DIY approaches (Google Sheets templates, saved prompts):** Some experienced teachers have built workarounds, but these are fragile, non-transferable, and not grounded in curriculum frameworks.

**The gap this product addresses:** A teacher should be able to input what they're teaching and who they're teaching it to, and receive immediately usable, pedagogically sound tiered tasks — without needing AI literacy, domain expertise in an unfamiliar subject, or significant prep time.

**Job to be Done:** When planning a lesson under time pressure, I want to generate classroom-ready differentiated tasks matched to my class profile, so that every student gets appropriately challenging work without costing me an additional 30–45 minutes of preparation.

---

## 2. User Research

This product is grounded in direct professional experience and peer observation, not desk research.

**Primary — Practitioner expertise:** I have 10+ years in primary and secondary classrooms, including specialist roles in Gifted and Talented education at St Catherine's School (Sydney) and curriculum development at Euka Future Learning. In these roles I designed differentiated programs daily, trained 20+ teachers in differentiation practice, and directly observed where the planning burden was highest: teachers who understood differentiation in principle but lacked the time to implement it consistently for every lesson. This represents structured professional observation across multiple school contexts, year levels, and subject areas.

**Secondary — Peer conversations:** Through relief teaching engagements and informal conversations with colleagues, I have observed consistent pain points across multiple Sydney schools:
- Teachers default to a single task for the whole class and informally lower or raise expectations — this is not genuine differentiation and rarely meets the needs of outlier learners
- G&T students are frequently given "more of the same" rather than higher-order tasks, because designing genuine extension takes planning time teachers don't have
- Teachers with large EAL/D cohorts often lack subject-specific scaffolding strategies outside literacy-focused contexts

**Validation — Pre-submission user testing:** Prior to submitting this application, I shared the working tool with two classroom teachers for a brief feedback session. Key findings:
- Both used the tool to generate tasks for an upcoming lesson and reported the output was "immediately usable without significant editing"
- One teacher noted that the scaffolds section for Learning Support students was the most valuable part — "that's the bit I always struggle with"
- Suggested improvement: teachers also want to know which students belong to which tier for grouping purposes, not just what each tier's tasks are (v2 feature)

**What this research confirmed:**
- The problem is real and unsolved for classroom teachers, as distinct from curriculum leaders who have dedicated planning time
- "Immediately usable" is the critical requirement — tasks requiring significant editing will be abandoned, regardless of quality
- Australian Curriculum alignment and Australian English are table-stakes for teacher trust, not nice-to-haves

---

## 2b. Stakeholder Map

| Stakeholder | Role | Primary concern | Influence on adoption |
|-------------|------|----------------|----------------------|
| Classroom teacher | Direct user | Time saving, output quality, ease of use | High — voluntary adoption; if it doesn't save time, they stop |
| Curriculum coordinator | Champion / gatekeeper | Curriculum alignment, quality control, consistency | High — can mandate or block school-wide uptake |
| School principal | Decision-maker | Privacy, liability, cost, reputational risk | Moderate — sets policy; unlikely to engage with tool directly |
| IT administrator | Gatekeeper | Data privacy, API key management, security compliance | Moderate — controls what tools can be deployed on school systems |
| G&T / Learning Support coordinator | Specialist influencer | Tier accuracy, appropriateness for identified students | Moderate — trusted voice on differentiation quality |
| Student | Indirect beneficiary | Task quality, appropriateness, engagement | Low — no direct interaction with the tool |

**Implication for v1:** The classroom teacher is the only user who interacts directly with the tool. All other stakeholders influence whether the tool gets introduced, continues to be used, or gets blocked — but none of them use it. This means adoption strategy must account for two distinct audiences: the teacher (who needs quality output quickly) and the gatekeeper (who needs assurance on privacy and curriculum alignment).

---

## 3. Goals & Success Metrics

### Product Goal
Reduce the time a teacher spends generating differentiated tasks for a lesson from 30–45 minutes to under 5 minutes, without sacrificing pedagogical quality.

**North Star metric:** Return usage rate — a teacher who comes back has found genuine value. All other metrics are diagnostic; this one defines success.

### Success Metrics

| Metric | Target | How It Would Be Measured |
|--------|--------|--------------------------|
| Time to first value (TTFV) | < 10 seconds from submission to first rendered output | Performance monitoring / Vercel analytics |
| Activation rate | ≥ 80% of first-time users complete at least one generation | Zapier log (first entry per unique session) |
| Task usage rate | ≥ 70% of generated tasks used with minimal or no modification | Post-use teacher survey |
| Return usage rate ⭐ | ≥ 50% of first-time users return within 2 weeks | Google Sheets usage log (via Zapier) |
| Generation error rate | < 5% (malformed JSON, empty output, off-topic response) | Error logging |
| Teacher-reported time saving | ≥ 20 minutes per lesson planning session | Feedback form |

### Non-Goals for v1
- Measuring student learning outcomes (requires longitudinal data and a fundamentally different research design)
- Administrative reporting at school or district level
- Integration with school information systems
- Student-facing task delivery

### Adoption Considerations

Building the tool solves half the problem. Getting teachers to use it — and keep using it — is the other half. This section maps the adoption journey from discovery to habitual use.

**Awareness:** Teachers are unlikely to find this tool through search. Initial discovery relies on peer recommendation (a colleague shares it) or institutional introduction (a curriculum coordinator includes it in a planning session). A school-wide rollout requires a human champion at coordinator or leadership level — a URL alone is not an adoption strategy.

**Activation:** The activation moment is the first generation a teacher actually uses in a lesson — not just the first click. The UI supports this by producing output that is immediately formatted and classroom-ready, minimising the steps between generation and use. Every additional step between output and classroom application is an adoption risk.

**Ability:** The input form is deliberately minimal — objective, year level, subject, class profile counts. No AI literacy required. A teacher who can complete a lesson plan template can use this tool. Low-friction ability is a design decision, not a UX afterthought.

**Reinforcement:** The tool earns its own reinforcement if output quality is high — a teacher who saves 30 minutes once is motivated to return. Zapier logging enables early detection of drop-off: if return usage falls below target at Week 4, prompt design or output quality is the first variable to investigate, not awareness or marketing.

**Primary adoption risk:** Habit displacement. Teachers have established planning workflows this tool must displace. The v2 priority of saving lesson history directly addresses this — a teacher with a library of past generated lessons has a stronger reason to return than one starting from scratch each session.

---

## 4. MVP Scope & Prioritisation

### What's in v1

| Feature | Rationale |
|---------|-----------|
| Lesson objective input | Core user need — the starting point for all differentiation |
| Year level + subject selection | Minimum context required for AC v9 alignment in the prompt |
| Class profile (4 student group types) | Minimum viable profile: LS, Standard, Extension/G&T, EAL/D |
| 3-tier task output | The standard differentiation model in Australian schools |
| Scaffolds for Learning Support tier | High-value-add; consistently the hardest tier for teachers to plan for |
| Extension challenges for G&T tier | Directly addresses the "more of the same" problem for G&T students |
| Zapier webhook → Google Sheets logging | Lightweight analytics to validate usage patterns without a database |

### What's Deliberately Out of Scope for v1

| Excluded Feature | Reason for Exclusion |
|-----------------|---------------------|
| Export to Google Doc / Word | High implementation effort; validates generation quality before adding formatting complexity |
| Saved lesson history | Requires authentication and a database; disproportionate complexity before core value is validated |
| Student-facing interface | Different product with different trust, safety, and design requirements |
| LMS integration | Significant integration work (LTI 1.3 or API); validate standalone value first |
| Multi-lesson / unit planning | Increases cognitive load without validating single-lesson utility |
| Subject-specific templates | Would improve output quality but introduces scope creep before validation |

### Prioritisation Framework

Features were assessed on Impact vs. Effort:
- **High impact, low effort → v1:** Core generation flow, AC v9 framing, scaffolds, challenges, usage logging
- **High impact, high effort → v2:** Export, LMS integration, saved history
- **Lower impact → backlog:** UI polish items (copy to clipboard, print view)
- **Not planned:** Admin dashboard, student analytics, multi-tenancy

### Known Risks — v1

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Model outputs pedagogically incorrect tasks | Medium | High | Teacher review required before use; explicit disclaimer in UI at every output |
| Anthropic API downtime | Low | High | Graceful error state displayed to teacher; no cached fallback in v1 — acknowledged gap |
| Teacher over-reliance — stops critically reviewing output | Medium | Medium | UI copy reinforces "review before use" at every generation; tool is framed as a planning aid, not a replacement for teacher judgement |
| Privacy: class profile data transmitted to third-party API | Medium | High | No student PII collected (aggregate counts only); Australian Privacy Act 1988 assessment required before any institutional deployment |
| Adoption stalls after first use | Medium | High | Zapier logging enables early detection; v2 to include return-usage prompt if no activity recorded within 2 weeks |
| Vendor dependency: Anthropic model deprecation or pricing change | Low | Medium | Model ID pinned to `claude-sonnet-4-6`; deprecation notices monitored; migration path to be documented ahead of any v2 release |

---

## 5. API Integration — Capabilities, Constraints & Product Decisions

This section documents how I engaged with the Anthropic API as a set of product inputs and constraints — not just a technical dependency.

### Model Selection

| Model | Consideration | Decision |
|-------|---------------|----------|
| `claude-haiku-4-5` | Lowest cost and latency | Output quality for pedagogical nuance was insufficient — tasks were generic and missed curriculum-specific language in testing |
| `claude-sonnet-4-6` | Mid-tier cost and latency | **Selected.** Optimal balance of output quality, cost, and generation speed for this use case |
| `claude-opus-4-8` | Current flagship — highest quality | Output quality improvement over Sonnet was marginal for structured task generation; cost and latency tradeoff not justified at MVP stage |

### Token Budget

`max_tokens: 1000` was set after systematic testing:
- Below 800: Extension challenges were frequently truncated or omitted entirely
- 1000: Consistently generates all three tiers with scaffolds and challenges at appropriate length
- Above 1200: Tasks became verbose and required editing before use — defeating the core value proposition

This was a product decision, not just a parameter choice. Task length directly affects adoption: a teacher who has to trim every output will stop using the tool.

### Prompt Engineering as a Product Decision

The system prompt went through multiple iterations. Key decisions and the reasoning behind them:

**Enforcing JSON output:** Early versions used free-text output, which required fragile parsing that broke on edge cases (mid-sentence list items, inconsistent tier naming). Enforcing a strict JSON schema in the prompt — `"Return ONLY valid JSON — no markdown, no backticks, no preamble"` — resolved this. This is a reliability decision with direct UX impact: malformed output means a blank screen for the teacher.

**AC v9 and Australian English:** Without explicit curriculum anchoring, Claude defaulted to US Common Core language ("standards," "rigor," "customize") in approximately 40% of test generations. For an Australian teacher, this breaks trust immediately — the tool feels like it wasn't made for them. Enforcing AC v9 framing and Australian English is a product trust decision, not just a localisation preference.

**Specificity instruction:** Early prompt versions produced tasks using vague verbs: "explore the concept," "investigate the text," "discuss with a partner." Adding `"Be specific and immediately actionable — avoid generic verbs without concrete direction"` significantly improved task quality. This mirrors the user research finding that teachers abandon tools that produce outputs they need to substantially rewrite.

### Rate Limits and Cost at Scale

Current API usage is well within standard Anthropic limits for individual use. At institutional scale, the picture changes meaningfully:

| Scale | Est. Daily Generations | Est. Daily API Cost | Implication |
|-------|----------------------|--------------------|-|
| Single teacher | ~5 | ~$0.02 | Negligible |
| One school (50 teachers) | ~250 | ~$1.00 | Manageable with monitoring |
| District (500 teachers) | ~2,500 | ~$10.00 | Requires cost controls, tier review, caching |

At school scale, I would implement: request queuing to manage burst-rate spikes, output caching for common lesson objective patterns (same objective + similar profile → reuse output with minimal regeneration), and administrator-facing usage dashboards.

### Latency

Generation takes approximately 3–5 seconds. This is acceptable for a planning tool used at a desk before a lesson. It would be unacceptable for a student-facing, in-class tool where teachers need real-time response. A classroom version would require a different architecture: streaming responses, pre-generated output banks, or a faster model with tighter output constraints.

---

## 6. Integration Considerations

*What would it look like if a school, LMS vendor, or EdTech platform wanted to embed this tool?*

**Authentication:** The current tool is unauthenticated (open access). School deployment would require OAuth 2.0 or LTI 1.3 (the standard protocol for LMS tool integration, used by Canvas, Moodle, and others) to authenticate teachers and associate usage data with school accounts.

**API Key Management:** In the current architecture, the Anthropic API key belongs to the tool owner, protected via a Vercel serverless function. At school or enterprise scale, this would need to be re-architected as either: (a) the institution provides its own Anthropic API key, or (b) the tool is offered as a SaaS product with API costs built into subscription pricing. This choice has significant commercial and technical architecture implications that would need to be resolved before institutional deployment.

**Data Privacy:** Teacher inputs — lesson objectives and class profiles — are transmitted to the Anthropic API for processing. For school deployment, this requires assessment against the Australian Privacy Act 1988 and relevant state education department data governance policies. Class profile data, even without individual student identifiers, may be considered sensitive under some interpretations. At enterprise scale, Anthropic's enterprise data processing agreements would need to be in place before deployment.

**Webhooks for School Systems:** The current Zapier integration logs to Google Sheets. A school integration would more likely require a direct webhook connecting to the school's SIS (Student Information System) or curriculum planning tools. The webhook payload structure I have designed — timestamp, lesson objective, class profile, generated output — is intentionally structured to be useful in both contexts.

**Developer Experience Note:** If this tool were to expose its own API for third-party builders (for example, an LMS vendor wanting to embed the generation capability), I would expose a single POST endpoint accepting a lesson objective and class profile and returning the structured tier JSON. Rate limiting would be per institution rather than per teacher. Documentation would need to cover the AC v9 alignment constraints, the JSON output schema, and the known limitations of the model's pedagogical knowledge.

---

## 7. Zapier Webhook — A Product Decision

### Why Zapier, Not a Direct Database or Custom Endpoint

I chose Zapier over a custom backend logging solution for deliberate reasons grounded in stage-appropriateness:

**Speed to validation:** Zapier's webhook-to-Google Sheets Zap can be configured in under 30 minutes. A custom logging endpoint requires a database, an authenticated server endpoint, and ongoing maintenance. At MVP stage, the value is in what the data reveals about usage patterns, not in how it is stored or queried.

**Accessibility for non-technical stakeholders:** Google Sheets is the default reporting tool in most school environments. Any curriculum coordinator, principal, or researcher I give access to can interrogate usage data immediately, without needing a custom dashboard built first.

**No-code extensibility:** If a school administrator wanted to add a simple alert — "email me when 100 generations have been logged" — they can configure this in Zapier without engineering resource. This matters for the target deployment context, where schools often lack in-house technical capacity.

### What the Integration Captures

Each webhook payload logs: timestamp, lesson objective, year level, subject, class profile (student counts per tier), and the full generated task output. This enables:
- Usage frequency and pattern analysis (which subjects and year levels generate most demand)
- A corpus of lesson objectives to inform future prompt improvement
- Return usage signals (same user, multiple entries over time)
- Output quality audit (reviewing generated tasks against teacher-reported satisfaction)

### What I Would Change at Scale

Zapier's free tier handles 100 tasks per month — appropriate for validation, not for production at even a single school. At institutional scale, I would replace Zapier with a direct webhook to a purpose-built analytics service (PostHog for product usage analytics, or a lightweight custom endpoint backed by a time-series database). The Zapier integration was the right choice for this stage because the question being answered is "is this tool being used and by whom?" — not "how do we build a reporting infrastructure?"

This is a deliberate stage-gate decision: validate usage before investing in infrastructure.

---

## 8. Architecture Overview

```
Teacher (browser)
    │
    ▼
Frontend — React, deployed on Vercel
    │
    ▼
Vercel Serverless Function  (/api/generate)
    │  (API key held here — never exposed to browser)
    ▼
Anthropic Claude API  (claude-sonnet-4-6)
    │
    ▼
Structured JSON response → Rendered tier cards (frontend)
    │
    ▼ (parallel, non-blocking)
Zapier Webhook → Google Sheets  (usage log)
```

**Security note:** The Anthropic API key is stored in a Vercel environment variable and accessed exclusively through the serverless function. It is never included in client-side code or exposed in browser requests. This is standard practice for protecting API credentials in frontend-adjacent deployments and an explicit requirement for any production deployment.

---

## 9. What's Next — v2 Roadmap

Features are prioritised in order of what I would want to learn from v1 usage data before building, and what delivers the most immediate additional teacher value.

| Priority | Feature | What I Need to Learn First | Metric it would move |
|----------|---------|---------------------------|----------------------|
| 1 | Export to Google Doc / Word | Do teachers use this primarily at a desk (export useful) or in class on a tablet (copy-paste sufficient)? | Task usage rate — reduces friction between generation and classroom deployment |
| 2 | Australian Curriculum content descriptor tagging | Do teachers want tasks aligned to specific AC descriptors, or does this add unhelpful cognitive overhead? | Task usage rate — increases perceived quality and curriculum trust |
| 3 | Saved lesson history | What is the return usage rate from v1 data? High return rate justifies authentication complexity. | Return usage rate — gives teachers a persistent reason to return |
| 4 | Subject-specific prompt templates | Which subjects generate the most demand in v1 logs? Build templates for top 3 only. | Activation rate — reduces friction for first-time generation |
| 5 | Grouping output | User testing feedback: teachers want to know which students belong to which tier for physical grouping, not just what tasks each tier receives | Task usage rate — closes the identified gap from user research |
| 6 | LMS integration via LTI 1.3 | Requires an LMS partner; only worth pursuing if v1 validates standalone usage | Activation rate — embeds tool in existing teacher workflow |

---

## 10. Lessons Learned

**An assumption that broke:** I initially designed all class profile fields as required inputs, assuming teachers would know the precise breakdown of their class by ability level. In practice, many don't — they have a rough sense ("maybe 4 or 5 G&T students") rather than a verified count. I changed all fields to optional with a default of zero. The tool remains useful with incomplete information. This was caught early because I am a teacher and recognised the assumption immediately. A developer without domain knowledge would likely have shipped the required-fields version and wondered why completion rates were low.

**What I would do differently:** Conduct at least one round of user interviews before wireframing, not after building. My practitioner knowledge gave me strong instincts about the core feature set but caused me to miss the grouping use case — teachers want to know *which students* belong to which tier so they can form working groups, not just *what tasks* each tier should do. That is a meaningful product gap that structured user research would have surfaced earlier.

**What I learned about building AI tools for educators:** Trust is the product. Teachers have encountered enough educational technology that promised transformation and delivered confusion that they are appropriately sceptical. With AI-powered tools, trust is built through specificity — a task that references "Year 5 English, persuasive texts, Australian Curriculum" feels like it was designed for this lesson; a task that says "encourage students to explore language features" feels like a template that could apply to anything. The prompt engineering work in this project was fundamentally about building teacher trust, not about making the model technically perform better. These are related but distinct goals.

**On the API as a product input:** Building on a generative AI API is different from building on a deterministic API. Output variability is a product design problem, not just a technical one. Designing around model behaviour — output schemas, consistency constraints, graceful error handling for edge cases — is a form of product thinking I hadn't fully appreciated before this build. A product that works 95% of the time and fails invisibly the other 5% will lose teacher trust faster than one that works 85% of the time but fails visibly with a clear error message. Reliability engineering is UX.

---

*PRD v1.0 — June 2026 | Gloria Seo | [github.com/your-repo]*
