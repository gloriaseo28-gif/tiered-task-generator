# Tiered Task Generator — Product Requirements Document

**Product:** Tiered Task Generator — Assessment Worksheet Generator  
**Version:** 2.2  
**Author:** Gloria Seo  
**Date:** June 2026  
**Status:** v2.2 Live  
**Live URL:** https://tiered-task-generator.vercel.app  
**Repo:** https://github.com/gloriaseo28-gif/tiered-task-generator

---

## Executive Summary

**What it is:** A working, AI-powered web application that generates print-ready differentiated assessment worksheets and exit slips for K–10 teachers. The teacher inputs a lesson objective, NSW Syllabus outcome, and class profile; the tool returns three tiers of classroom-ready questions — ◆ Foundation, ◆◆ Core, ◆◆◆ Extension — grouped by difficulty level, plus a three-question exit slip mapped to the specified syllabus outcome. Output renders on screen and prints to A4 in under 15 seconds.

**The problem:** Differentiation is legally required in Australian classrooms but consistently one of the most time-consuming parts of lesson planning. Existing tools — generic AI chatbots, pre-authored curriculum platforms — do not produce actual questions aligned to a teacher's specific class profile and NSW Syllabus outcome. Teachers who want differentiated resources either spend 30–45 minutes creating them manually or default to one task for the whole class.

**Built and shipped:** Working deployed application (HTML/JS frontend + Vercel serverless function + Anthropic Claude API), NSW Syllabus Outcome input field, tier-grouped worksheet layout, print CSS (A4), answer key toggle, Copy Form Text button for Google Forms integration, public GitHub repository with full PRD documentation.

**Key product decisions:**
- `claude-sonnet-4-6` selected over Haiku (insufficient pedagogical nuance) and Opus (unjustified cost/latency tradeoff)
- Pivoted from task descriptions to actual questions after v1 revealed descriptions require teacher interpretation — the resource itself is the value, not planning guidance
- JSON schema enforcement in prompt — a reliability decision with direct UX impact; free-text output truncated unpredictably
- `max_tokens` increased to 4096 after production incident — JSON truncation at 3000 tokens identified via Vercel logs and resolved within 10 minutes
- Questions grouped by difficulty tier (not interleaved by concept) — based on classroom practicality feedback; teachers direct students to their section, not to navigate three-way splits within each concept
- NSW Syllabus Outcome field added as optional input — teacher-specified outcome is treated as authoritative alignment anchor, replacing AI inference

**North Star metric:** Return usage rate — target ≥ 50% of first-time users return within 2 weeks.

**Status:** v2.2 live. Quality testing across three subjects (Year 6 Maths, Year 4 English, Year 8 Science) confirms consistent output quality. Remaining work: Make.com automation (response capture and AI analysis), PRD finalisation, cover letters.

| | |
|---|---|
| **Live URL** | https://tiered-task-generator.vercel.app |
| **GitHub repo** | https://github.com/gloriaseo28-gif/tiered-task-generator |
| **Model** | claude-sonnet-4-6 |
| **Stack** | HTML/JS · Vercel serverless · Anthropic API · Google Forms · Make.com (planned) |

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
9. [What's Next — v3 Roadmap](#9-whats-next--v3-roadmap)
10. [Product Iteration Log](#10-product-iteration-log)
11. [Known Limitations & Future Paths](#11-known-limitations--future-paths)
12. [Lessons Learned](#12-lessons-learned)

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

The token limit evolved through production use — each change driven by a specific failure mode discovered after deployment, not in advance.

| Version | `max_tokens` | Reason for change |
|---------|-------------|-------------------|
| v1 (task descriptions) | 1,000 | Sufficient for short task description output |
| v2 initial (worksheet) | 3,000 | Set to accommodate longer worksheet + exit slip output |
| v2 fix — 26 June | 4,096 | Production truncation: `SyntaxError: Unterminated string in JSON at position 8479`. Maths and English resolved. |
| v2 fix — 28 June | 6,000 | Production truncation persisted for Science: position 14,838. Subject-variable verbosity identified as root cause. |

**Subject-variable output verbosity** is the key insight from this evolution. Science questions require physical law descriptions, units in every calculation step, and longer contextual setup per question. A Year 8 Newton's Laws worksheet generates materially more JSON than a Year 6 Percentages worksheet at the same question count. Output verbosity scales with subject complexity, not just question count.

**Product implication at scale:** A fixed token limit risks truncation for verbose subjects. The appropriate architecture is dynamic token allocation — estimating expected output length from subject and year level before calling the API. Alternatively, a subject complexity classifier could route Science and HSIE requests to a higher token tier automatically. For current scope, 6,000 provides a safe ceiling across all subjects tested (Maths, English, Science).

This was a product decision at each stage, not just a technical parameter. Task length and completeness directly affect teacher trust: a worksheet that cuts off mid-question is unusable and will not be returned to.

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

## 9. What's Next — v3 Roadmap

v2.1 and v2.2 are shipped. The roadmap below reflects what comes next, prioritised by what v2 usage data would need to confirm before building, and by impact on the North Star metric.

| Priority | Feature | What I Need to Learn First | Metric it would move |
|----------|---------|---------------------------|----------------------|
| 1 | Export to Google Doc / Word | Do teachers use this at a desk (export useful) or on a tablet during class (copy-paste sufficient)? | Task usage rate — reduces friction between generation and classroom use |
| 2 | Make.com automation: response capture + AI analysis | Does the hybrid Google Forms format produce analysis accurate enough to be useful? Validate with 3 teachers first. | Return usage rate — teachers who get analysis come back for the next lesson |
| 3 | Saved lesson history | What is the return usage rate from v2 data? High return rate justifies authentication complexity. | Return usage rate — persistent library gives teachers a reason to return |
| 4 | Stage-specific NSW Syllabus embedding | Which stage and subject generates most demand in logs? Build Stage 3 Maths first. | Task usage rate — deeper alignment increases curriculum trust and perceived quality |
| 5 | AI vision on photographed student working | Is AI vision accurate enough to reduce teacher review burden below 10% of responses? | Return usage rate — removes the digital barrier for maths and science teachers |
| 6 | LTI 1.3 / Learnosity API integration | Requires LMS or Learnosity partnership; only worth pursuing if standalone usage is validated | Activation rate — embeds tool in existing teacher workflow; removes Google Forms workaround |

---

## 10. Product Iteration Log

This section documents the product evolution from v1 through v2.2 as a PM decision record. Each iteration was driven by a specific discovery or user insight, not by scope expansion.

### v1 — Task Description Generator (Shipped 26 June 2026)

**What shipped:** The tool accepted a lesson objective and class profile and returned three tiers of differentiated task *descriptions* — outlines of what students should do, not the actual resources.

**What v1 validated:** The core input model (lesson objective + class profile) is the right framing. Generation speed and Australian Curriculum alignment both confirmed as working.

**What v1 revealed:** Task descriptions require teacher interpretation before they become usable. A teacher who receives "design a word problem involving fractions" still has to write the word problem. The output was a planning aid, not a classroom resource — a different and less valuable product than what was needed.

---

### v2 — Assessment Worksheet Generator (Shipped 26 June 2026)

**The pivot decision:** The entire output layer was rebuilt. The tool now generates actual questions with working space, scaffolds for Foundation students, extension challenges for Extension/G&T students, and a three-question exit slip — replacing task descriptions entirely.

**Why this pivot:** Practitioner insight (10+ years in classrooms) confirmed by peer feedback. Teachers don't need help deciding what to teach. They need the resource in their hands. The gap between "task descriptions" and "questions students can answer right now" is where the tool was failing.

**The assessment angle:** Chosen deliberately. Learnosity is an assessment infrastructure company. Pivoting to an assessment output aligned the portfolio piece to the role domain — not as a surface-level signal but as a genuine product decision with pedagogical reasoning behind it.

**Production incident:** `max_tokens: 3000` caused JSON truncation on first live deployment — the model hit the token ceiling mid-response, producing valid JSON up to the limit then cutting off. Diagnosed via Vercel runtime logs (SyntaxError: Unterminated string in JSON at position 8479). Fixed by increasing `max_tokens` to 4096. Resolution time: under 10 minutes from error identification to verified fix in production. Documented as platform reliability management, not just a technical bug fix.

---

### v2.1 — Tier-Grouped Layout + Lesson Header (Shipped 27 June 2026)

**Tier grouping:** Questions previously appeared interleaved by concept — each concept section showed ◆ / ◆◆ / ◆◆◆ together. Changed to group all questions by tier across the full worksheet. Rationale: teachers direct students to their section at the start of the lesson. Three clear sections make that instruction natural. The interleaved format required more navigation from both teacher and student in practice.

**Lesson header:** Year level, subject, lesson objective, and NSW Syllabus outcome added to the top of the worksheet — on screen and on the printed page. A printed worksheet should be self-contained for filing, sharing, and future reference without needing the teacher to annotate it.

---

### v2.2 — NSW Syllabus Outcome Input Field (Shipped 28 June 2026)

NSW teachers plan and assess to syllabus outcomes — outcomes are the unit of curriculum accountability. Without an explicit outcome, the AI inferred it from the lesson objective, introducing interpretation that could be inaccurate across stages with similar language. With the teacher specifying the outcome, the system prompt treats it as the authoritative alignment anchor and maps exit slip questions directly to the specified code. Backwards compatible: if left blank, AI identifies the outcome as before.

---

## 11. Known Limitations & Future Paths

This section documents current limitations honestly, with proposed mitigations at each stage. A PM who can identify gaps and articulate solution paths demonstrates more rigour than one who papers over weaknesses.

### Limitation 1 — Digital Assessment Response Quality for Mathematics

**The problem:** The exit slip is designed to be completed on paper. If delivered digitally via Google Forms, students type free-text responses. For English and humanities, this works well — paragraph explanations are natural in a text field. For mathematics, three meaningful problems arise:

- **Typed text is unnatural for mathematical working.** A student who correctly calculates on paper might type "45" with no working — technically right but unassessable for method. The AI can only evaluate what it receives.
- **Partial credit becomes interpretive.** If a student answers part (a) correctly and part (b) incorrectly, the AI must infer that from a free-text string that may be formatted any number of ways.
- **Mathematical notation is lost.** Fractions, squared symbols, and division signs are approximated in text ("38 over 418", "x²"), requiring normalisation before evaluation and introducing ambiguity.

**Current mitigation — Hybrid response format:** Rather than pure free-text fields, the Google Form uses structured input types: numerical answers as fill-in-the-blank (auto-marked by Google Forms' native answer key at zero AI cost); one short text field per question for showing working or reasoning (sent to Claude for qualitative evaluation); multiple-choice for conclusions (auto-marked), with a text field for the explanation. This concentrates AI evaluation on qualitative reasoning — where it performs well — and removes format ambiguity from the quantitative parts.

**Near-term path — AI vision on photographed working (v3):** A student photographs their handwritten working; the image is uploaded to the API; the model extracts the working using OCR and spatial reasoning; and the working is evaluated against the expected method and answer. This bridges the notation gap and preserves the natural format for mathematics. Current limitation: frontier models are significantly improved at reading handwritten mathematics but not yet precise enough for unassisted automated marking. The appropriate architecture is AI-assisted review — the model evaluates clear-cut responses and flags borderline cases for teacher inspection, rather than auto-deciding mastery. Human in the loop on edge cases; AI handles the majority. This is defensible and practically deployable.

**Proper infrastructure solution — Learnosity API (v4):** Learnosity's item types — fill-in-the-blank, equation editor, MCQ, ordering, drag-and-drop — capture structured maths responses that are simultaneously auto-markable and pedagogically meaningful. No format mismatch, no notation problem, no Google Forms workaround. Response data is captured at item level, not paragraph level, which makes outcome-level analysis accurate rather than interpretive. The current tool exposes exactly the gap that Learnosity's infrastructure solves: consumer-grade response capture (Google Forms) is sufficient for individual teacher use but breaks at the precision required for reliable outcome mapping at scale. A v4 integration would replace Google Forms with Learnosity's delivery and response capture layer, feed structured item-level responses directly into the AI analysis endpoint, and produce outcome mastery data that is defensible for reporting purposes — not just indicative.

---

### Limitation 2 — NSW Syllabus Depth (Outcome Level Only)

**The problem:** The tool generates questions aligned to NSW Syllabus outcomes at the outcome level (e.g. MA3-7NA). It does not yet align to specific content descriptors, elaborations, or working mathematically processes within each outcome. A teacher planning to a specific content descriptor receives questions that address the outcome broadly but may not target the precise sub-skill they are teaching that day.

**Current mitigation:** The NSW Syllabus Outcome input field (v2.2) allows the teacher to specify the outcome explicitly, anchoring generation more precisely than AI inference alone.

**Future path — Stage-specific Syllabus Embedding (v3):** Embed the full NSW Syllabus outcomes, content descriptors, and elaborations for a target stage directly in the system prompt. This enables generation aligned to specific content descriptors, and marking criteria referenced to syllabus standards rather than generic answer keys. Implementation requires curriculum curation — the syllabus text must be accurate, not summarised. Planned scope: Stage 3 Mathematics and English first; other stages only after output quality is validated against known syllabus standards.

---

### Limitation 3 — Scale and Multi-Tenancy

**The problem:** The tool is built for individual teacher use. At school or district scale: there is no authentication (any teacher with the URL can access the tool, with no usage associated to a school or class); there is no persistent storage (lesson history exists only in the browser session); and the API key is shared across all users with no per-school rate limiting or cost allocation.

**Current mitigation:** Usage logging via Zapier → Google Sheets provides a lightweight audit trail without authentication. Appropriate for portfolio demonstration and individual use.

**Future path:** School-level deployment would require OAuth 2.0 or LTI 1.3 authentication, a database for persistent lesson history, and per-institution API key management or SaaS pricing that abstracts the API cost. This is 4–6 weeks of engineering work minimum, and should only be pursued after standalone usage validates the core value proposition.

---

### Limitation 4 — AI Output Reliability

**The problem:** Output varies between generations with identical inputs. A teacher who generates a worksheet and regenerates the following week receives different questions. The model can also produce pedagogically incorrect content — wrong mathematical answers, or questions that don't directly address the stated objective.

**Current mitigation:** Disclaimer displayed at the bottom of every output: "Review all content before distributing. Always exercise teacher judgement." Answer key toggle allows teachers to verify generated answers before distribution. JSON schema enforcement reduces structural variability; prompt constraints reduce content variability.

**Future path:** Output quality monitoring via usage logs (tracking teacher-reported accuracy), A/B testing of prompt variations against the task usage rate metric, and a per-question thumbs up/down mechanism that feeds into prompt refinement cycles.

---

### Limitation 5 — Subject-Variable Output Verbosity

**The problem:** Output token length varies significantly by subject. A Year 8 Science worksheet about Newton's Laws requires physical law descriptions, units in every calculation step, and longer contextual setup per question. This produces materially more JSON than a Year 6 Maths or Year 4 English worksheet at the same question count. A fixed `max_tokens` ceiling risks truncation for verbose subjects — which presents as a broken worksheet in the teacher's browser, not a graceful error.

**Evidence from production:** Three token limit increases were required after deployment:
- `max_tokens: 3000` (initial v2) → truncation on Maths
- `max_tokens: 4096` (26 June fix) → resolved Maths and English; truncation persisted for Science
- `max_tokens: 6000` (28 June fix) → resolved Science; current ceiling

**Current mitigation:** `max_tokens: 6000` with graceful error handling — if the API returns an error or truncated output, the teacher sees a clear error message and a "try again" prompt rather than a broken partial worksheet.

**Future path:** Dynamic token allocation based on subject and year level — estimating expected output verbosity before calling the API and setting `max_tokens` accordingly. A subject complexity classifier could route Science, HSIE, and other verbose subjects to a higher token tier automatically. This is a meaningful architecture improvement for multi-subject deployment at scale.

---

## 12. Lessons Learned

**An assumption that broke:** I initially designed all class profile fields as required inputs, assuming teachers would know the precise breakdown of their class by ability level. In practice, many don't — they have a rough sense ("maybe 4 or 5 G&T students") rather than a verified count. I changed all fields to optional with a default of zero. The tool remains useful with incomplete information. This was caught early because I am a teacher and recognised the assumption immediately. A developer without domain knowledge would likely have shipped the required-fields version and wondered why completion rates were low.

**What I would do differently:** Conduct at least one round of user interviews before wireframing, not after building. My practitioner knowledge gave me strong instincts about the core feature set but caused me to miss the grouping use case — teachers want to know *which students* belong to which tier so they can form working groups, not just *what tasks* each tier should do. That is a meaningful product gap that structured user research would have surfaced earlier.

**What I learned about building AI tools for educators:** Trust is the product. Teachers have encountered enough educational technology that promised transformation and delivered confusion that they are appropriately sceptical. With AI-powered tools, trust is built through specificity — a task that references "Year 5 English, persuasive texts, Australian Curriculum" feels like it was designed for this lesson; a task that says "encourage students to explore language features" feels like a template that could apply to anything. The prompt engineering work in this project was fundamentally about building teacher trust, not about making the model technically perform better. These are related but distinct goals.

**On the API as a product input:** Building on a generative AI API is different from building on a deterministic API. Output variability is a product design problem, not just a technical one. Designing around model behaviour — output schemas, consistency constraints, graceful error handling for edge cases — is a form of product thinking I hadn't fully appreciated before this build. A product that works 95% of the time and fails invisibly the other 5% will lose teacher trust faster than one that works 85% of the time but fails visibly with a clear error message. Reliability engineering is UX.

---

*PRD v2.2 — June 2026 | Gloria Seo | github.com/gloriaseo28-gif/tiered-task-generator*
