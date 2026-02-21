# Texas Insights Engine — Presentation Guide

**Use this for your demo: screenshots to take, what to say, sequence, and AWS service callouts.**

---

## Recommended sequence (6–8 minutes)

| # | Phase | What to show | Time |
|---|--------|----------------|------|
| 1 | Problem | Cold prep (Google/LinkedIn) vs. our flow | 0:00–0:30 |
| 2 | Create session | New Session form → trigger pipeline | 0:30–1:00 |
| 3 | AWS pipeline | Step Functions + Lambda/Bedrock (Console) | 1:00–1:45 |
| 4 | Interviewer brief | Session detail: brief, coaching cues, sources | 1:45–2:45 |
| 5 | Send packet | Copy Feedback Link → Interviewee view | 2:45–3:30 |
| 6 | Feedback | Corrections + question selection + opt-out | 3:30–4:15 |
| 7 | Update brief | Brief Updated with corrections highlighted | 4:15–4:45 |
| 8 | Live interview | Live Interview panel, phases, merge cues | 4:45–5:30 |
| 9 | Post-call | Post-Call Synthesis → Texas Insights schema | 5:30–6:15 |
| 10 | Governance | Governance Dashboard + audit, triggers | 6:15–7:00 |
| 11 | AWS recap | Architecture / services slide | 7:00–7:30 |
| 12 | Close | Before/after, “cold to warm in 5 minutes” | 7:30–8:00 |

---

## Screenshots to take (in order)

### 1. Problem / before
- **Screenshot:** Browser with a quick Google search for a company (e.g. “Trading Technologies company”) and a LinkedIn or press page.
- **Caption / say:** “This is how many interviews start: last-minute search, surface-level info, no structure. We change that.”

### 2. App home & create session
- **Screenshot 2a:** **Dashboard** — list of sessions, stats (Total Sessions, etc.), “New Session” button.
- **Screenshot 2b:** **New Session** — form with Business leader name, Company name, URL(s), optional PDF. Show “Create Session” as the single trigger.
- **Say:** “Interviewer creates a session with company name and URLs. This is the only trigger; no AI runs until they click Create.”

### 3. AWS — pipeline running
- **Screenshot 3a:** **Step Functions** (AWS Console) — open state machine `texas-insights-brief-pipeline-dev`, one execution in Running or Succeeded.
- **Screenshot 3b:** Same execution, **Graph** or **Table** view: steps **IngestSources** → **GenerateBrief** → **QualityCheck**.
- **Say:** “Behind the scenes: Step Functions orchestrates the pipeline. IngestSources fetches URLs and extracts text; GenerateBrief calls Bedrock; QualityCheck validates questions.”

### 4. AWS — Bedrock (optional)
- **Screenshot 4:** **Bedrock** console → **Model access** or **Playground** — show Claude model (e.g. Claude 3 Sonnet) enabled.
- **Say:** “We use Amazon Bedrock with Claude for company profiles, questions, and the full brief. No data leaves our AWS account.”

### 5. Session detail — Interviewer Brief
- **Screenshot 5a:** **Session** page — workflow steps: Created ✓, Brief Generated ✓, Packet Sent, Feedback, etc.
- **Screenshot 5b:** **Interviewer Brief** tab — Page 1: Company Overview, Market Context, Revenue Model Hypothesis, “What We Think We Know” with [High]/[Public] tags.
- **Screenshot 5c:** **Interviewer Brief** — Page 2: Interviewee-Selected Questions, Additional Questions, follow-up stems, coaching cues in [BRACKETS].
- **Screenshot 5d:** **Sources & Transparency** tab — Public URLs, AI Model (Bedrock Claude), Extracted content, entities.
- **Say:** “In under a minute we have a 2–3 page brief. Every assertion is tagged with confidence and source. Right-side coaching cues tell the interviewer when to pause and probe. Sources are listed so nothing is hidden.”

### 6. Interviewee packet & feedback link
- **Screenshot 6a:** **Interviewee Packet** tab — “What We Learned,” accuracy request, **question menu (5–6 questions)** with “Copy Feedback Link.”
- **Screenshot 6b:** Open feedback link in new tab or incognito — **Feedback** page: same summary, “Your Corrections Matter,” Add a Correction, **Select 2–3 questions**, transparency footer with **Opt out**.
- **Say:** “We send the interviewee a single link. They see what we think we know and can correct us and pick 2–3 questions. Trust is built before the call. They can also opt out at any time.”

### 7. Feedback submitted & Brief Updated
- **Screenshot 7a:** **Feedback** page after submit — “Thank you! Your feedback has been recorded.”
- **Screenshot 7b:** Back in **Session** — click **Update Brief** (or show status “Feedback” then “Brief Updated”). **Interviewer Brief** tab with corrections section at top (if any) and Interviewee-Selected questions first.
- **Say:** “After they submit, we regenerate the brief with their corrections at the top and their chosen questions first. The interviewer walks in knowing exactly what we got wrong.”

### 8. Live Interview
- **Screenshot 8:** **Live Interview** — phases (Opening, Corrections, Selected Qs, etc.), one question with follow-up stem and coaching cue, and “Merge/not-merge” or notes area.
- **Say:** “During the call the interviewer uses this panel: open with ‘What did we get wrong?’, then corrections, then their selected questions with follow-up stems. Coaching cues keep the conversation deep, not shallow.”

### 9. Post-Call Synthesis
- **Screenshot 9:** **Post-Call Synthesis** — form (corrections, key insights, surprises, follow-up) and/or result: Texas Insights schema (constraint map, strategic tensions, AI opportunities).
- **Say:** “After the call we map notes into our Texas Insights schema: constraints, market structure, strategic tensions, AI opportunities. Every interview feeds a growing knowledge base.”

### 10. Governance
- **Screenshot 10:** **Governance** — Audit log (CREATE_SESSION, INGEST_SOURCES, GENERATE_BRIEF, SUBMIT_CORRECTIONS, etc.), **Explicit triggers** section (Create Session, Send Packet), and **Transparency** (sources, consent).
- **Say:** “Nothing runs without a human trigger. Every action is logged. Sources are visible. Interviewees can opt out. That’s how we keep AI responsible.”

### 11. AWS architecture (slide or diagram)
- **Screenshot or slide:** High-level diagram or list:
  - **Amplify** — Hosting the React app  
  - **Cognito** — Auth  
  - **API Gateway** — REST API  
  - **Lambda** — Create session, Ingest, Generate brief, Quality check, Get/List session, Send packet, Submit corrections, Update brief, Post-call synthesis  
  - **Step Functions** — Brief generation pipeline  
  - **Bedrock** — Claude for briefs and synthesis  
  - **Comprehend** — Entities, key phrases (and PII in production)  
  - **S3** — Briefs, packets, documents  
  - **DynamoDB** — Sessions, corrections, audit, knowledge graph  
- **Say:** “All of this runs on AWS: serverless APIs, Step Functions for the pipeline, Bedrock for the LLM, and full audit and storage.”

### 12. Closing
- **Slide or split screen:** Left = “Before: Google 10 min before the call.” Right = “After: Brief, packet, corrections, selected questions, 5-minute prep.”
- **Say:** “From cold to warm in 5 minutes. That’s the Texas Insights Engine.”

---

## What to explain at each step (script bullets)

### Opening (0:00–0:30)
- “Texas A&M students and faculty run business intelligence interviews across Texas.”
- “Today, prep is either hours of manual research or going in cold. The first 20–30% of the call is often wasted.”
- “We built Texas Insights Engine: AI prepares a brief and a one-page packet. The interviewee corrects us and picks questions. The conversation starts warm, not cold.”

### Create session (0:30–1:00)
- “The interviewer creates a session: company name, leader name, and URLs. Optional PDF. No AI runs until they click Create — explicit trigger only.”
- “That one click kicks off our pipeline in AWS.”

### AWS pipeline (1:00–1:45)
- “Step Functions runs the pipeline: IngestSources fetches and chunks the URLs; GenerateBrief calls Bedrock to build the company profile, questions, and full brief; QualityCheck validates that questions are open-ended and non-leading.”
- “We use Amazon Bedrock with Claude so generation stays inside our account and is auditable.”

### Interviewer brief (1:45–2:45)
- “The output is a 2–3 page interviewer brief: company overview, market context, revenue hypothesis, and ‘What We Think We Know’ — each assertion tagged with confidence and source.”
- “Page 2 is the question sequence: interviewee-selected questions first, then additional ones, with follow-up stems and right-side coaching cues.”
- “Sources & Transparency shows exactly what we used: public URLs, Bedrock, extracted content. No black box.”

### Send packet & feedback (2:45–4:15)
- “We send the interviewee one link. They get a one-page packet: what we learned, an accuracy request, and 5–6 questions to choose from. They select 2–3 and can add corrections.”
- “They can also opt out. Everything is consent-driven and transparent.”
- “When they submit, we store corrections and selected questions and mark the session as feedback received.”

### Update brief (4:15–4:45)
- “The interviewer clicks Update Brief. We regenerate the brief with corrections at the top and their selected questions first. So the opening line is literally: ‘Thanks for reviewing the packet. What did we get wrong?’”

### Live interview (4:45–5:30)
- “During the call they use the Live Interview view: opening, corrections, then selected questions with follow-up stems and coaching cues. We’re working toward a merge/not-merge panel for live AI suggestions; for the demo we show the structured flow and cues.”

### Post-call (5:30–6:15)
- “After the call, the interviewer does post-call synthesis: key insights, surprises, constraints. We map that into the Texas Insights schema — constraints, market structure, strategic tensions, AI opportunities — so every interview feeds the knowledge base.”

### Governance (6:15–7:00)
- “Governance is built in: explicit triggers only, audit log for every action, source transparency, and interviewee opt-out. No proactive scraping; no data without consent.”

### AWS recap & close (7:00–8:00)
- “We run on Amplify, Cognito, API Gateway, Lambda, Step Functions, Bedrock, Comprehend, S3, and DynamoDB. Serverless, scalable, and fully on AWS.”
- “Before: cold Google search. After: structured brief, packet, corrections, and selected questions in about 5 minutes. That’s the Texas Insights Engine.”

---

## AWS services to name when (quick reference)

| When you show… | Say… |
|----------------|------|
| Login / sign-up | “We use **Amazon Cognito** for authentication.” |
| Create Session button | “This hits **API Gateway** and **Lambda**; Lambda starts a **Step Functions** execution.” |
| Step Functions graph | “**Step Functions** orchestrates **Lambda** for ingest and **Bedrock** for the brief.” |
| Brief content | “Company profile and questions are generated by **Amazon Bedrock** with Claude.” |
| Sources panel | “URLs are fetched by **Lambda**; entities can come from **Comprehend**; we store everything in **S3** and **DynamoDB**.” |
| Feedback form (public link) | “This is a public endpoint behind **API Gateway**; no login. Submissions go to **Lambda** and **DynamoDB**.” |
| Update Brief | “**Lambda** loads the session from **DynamoDB**, calls **Bedrock** again with corrections, and saves the new brief to **S3**.” |
| Governance / audit | “Every action is logged in **DynamoDB**; we can add **CloudWatch** for operational logs.” |
| Hosting | “The app is hosted on **AWS Amplify**.” |

---

## Checklist before you present

- [ ] One session already created and **Brief Generated** (so you don’t wait on pipeline during demo).
- [ ] Same session has **Packet Sent** and (optional) **Feedback** submitted so you can show Update Brief and corrections.
- [ ] Browser tabs: App (Dashboard), Session detail, Feedback page (from link), Live Interview, Post-Call Synthesis, Governance. AWS Console: Step Functions, optionally Bedrock.
- [ ] If live-creating a session: use a fast company/URL so Ingest + Generate finish in 1–2 minutes, or use a pre-created session for the main walkthrough.
- [ ] Close other apps and notifications; zoom browser to 100–125% so UI is readable on the big screen.

---

## One-page flow (for a single slide)

```
[Interviewer] Create Session (company + URLs)
       → API Gateway + Lambda → Step Functions
       → IngestSources (Lambda) → GenerateBrief (Lambda + Bedrock) → QualityCheck (Lambda)
       → S3 + DynamoDB
[Interviewer] Reviews Brief, clicks Send Packet
[Interviewee] Opens link → Feedback page (corrections + select 2–3 questions) → Submit
[Interviewer] Update Brief → Bedrock regenerates with corrections + selected Qs first
[Interviewer] Live Interview (opening → corrections → selected Qs → cues)
[Interviewer] Post-Call Synthesis → Texas Insights schema → DynamoDB
[Governance] Audit log, triggers, transparency, opt-out
```

Use this flow on a single slide to orient the judges, then follow the screenshot sequence and script above.
