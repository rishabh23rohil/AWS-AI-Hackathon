# Texas Insights Engine

**AI-powered interview intelligence: turn cold outreach into warm, insight-rich conversations.**

Mays Business School, Texas A&M University · AWS AI Hackathon 2025

---

## What It Does

- **Pre-interview:** You provide company name and URLs (and optional PDF). The system ingests content (Comprehend, Textract), then uses **Amazon Bedrock (Claude 3 Sonnet)** to generate a company profile, interviewer brief with coaching cues, and a one-page interviewee packet.
- **Interviewee feedback:** Interviewees review the packet, correct facts, and select 2–3 questions—no login required.
- **Update brief:** The brief is regenerated with corrections; versioned in S3.
- **Post-call:** Structured synthesis and insights are written to DynamoDB for the Texas Insights knowledge model.
- **Governance:** Explicit triggers only, full audit log, consent tracking, source transparency.

---

## Demo / Screenshots

### UI

| Dashboard | New Session | Tech & Architecture |
|-----------|-------------|----------------------|
| ![Dashboard](./screenshots/ui/ui-dashboard.png) | ![New Session](./screenshots/ui/ui-new-session.png) | ![Tech & Architecture](./screenshots/ui/ui-tech-architecture.png) |

| Governance | Dashboard (mobile) |
|------------|---------------------|
| ![Governance](./screenshots/ui/ui-governance.png) | ![Dashboard mobile](./screenshots/ui/ui-dashboard-mobile.png) |

---

## Architecture Overview

```mermaid
flowchart LR
  subgraph Client
    React[React / Amplify]
  end
  subgraph API
    GW[API Gateway]
    Cognito[Cognito]
  end
  subgraph Compute
    Lambda[Lambda]
    SFN[Step Functions]
  end
  subgraph Ingest
    Comp[Comprehend]
    Tx[Textract]
  end
  subgraph GenAI
    Bedrock[Bedrock Claude 3]
  end
  subgraph Storage
    S3[(S3)]
    DDB[(DynamoDB)]
  end
  subgraph Delivery
    SES[SES]
  end
  React --> GW
  GW --> Cognito
  GW --> Lambda
  Lambda --> SFN
  SFN --> Lambda
  Lambda --> Comp
  Lambda --> Tx
  Lambda --> Bedrock
  Lambda --> S3
  Lambda --> DDB
  Lambda --> SES
```

High-level: **React (Amplify)** → **API Gateway + Cognito** → **Lambda** (create session, send packet, corrections, update brief, synthesis) and **Step Functions** (orchestrates ingest → generate brief → quality check). Ingest uses **Comprehend** and **Textract**; brief and synthesis use **Bedrock**; artifacts in **S3** and **DynamoDB**; optional email via **SES**.

---

## End-to-End Flow

1. **Interviewer** creates a session (company name, URLs, optional PDF) → **Create Session** Lambda writes DynamoDB, optionally S3 presigned URL, starts **Step Function**.
2. **Step Function:** **Ingest** (fetch URLs, Textract PDF, Comprehend entities/key phrases) → **Generate Brief** (Bedrock: profile, questions, interviewer brief, interviewee packet) → **Quality Check** (optional regenerate) → **Brief Ready** (S3 + DynamoDB).
3. **Interviewer** sends packet (link or SES email) → **Interviewee** opens feedback page (no auth), submits corrections and selected questions.
4. **Update Brief** Lambda loads corrections, calls Bedrock again → new brief version in S3.
5. **Post-call:** Interviewer submits notes → **Synthesis** Lambda (Bedrock) → S3 + DynamoDB insights.

```mermaid
sequenceDiagram
  participant U as Interviewer
  participant API as API Gateway
  participant CS as Create Session
  participant SFN as Step Functions
  participant Gen as Generate Brief
  participant Int as Interviewee
  participant UB as Update Brief
  participant Syn as Synthesis
  U->>API: POST /sessions
  API->>CS: invoke
  CS->>SFN: start execution
  SFN->>Gen: Ingest → Generate → Quality
  Gen->>Gen: Bedrock ×4, S3, DynamoDB
  U->>Int: Send packet link
  Int->>API: POST /corrections (no auth)
  U->>API: POST /update-brief
  API->>UB: Bedrock + corrections
  U->>API: POST /synthesis
  API->>Syn: Bedrock → DynamoDB
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, AWS Amplify (hosting), Cognito (auth) |
| API | API Gateway (REST), Cognito authorizer |
| Compute | Lambda (10 functions), Step Functions |
| AI/ML | Amazon Bedrock (Claude 3 Sonnet), Comprehend, Textract |
| Data | DynamoDB (5 tables), S3, SES (optional) |
| IaC | AWS SAM |

---

## Setup (Local Run)

### Prerequisites

- Node.js 18+
- AWS CLI configured
- AWS SAM CLI
- Python 3.9+ (Lambda runtime)

### Backend

```bash
cd backend
sam build
sam deploy --guided
```

Note the API URL and Cognito User Pool/Client ID from the outputs.

### Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env: REACT_APP_API_URL, REACT_APP_USER_POOL_ID, REACT_APP_USER_POOL_CLIENT_ID, REACT_APP_AWS_REGION
npm install
npm start
```

### Env template (no real values)

```env
REACT_APP_API_URL=https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/dev
REACT_APP_AWS_REGION=us-east-1
REACT_APP_USER_POOL_ID=us-east-1_XXXXXXXXX
REACT_APP_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## AWS Evidence

| Service | Screenshot |
|---------|------------|
| Bedrock (Claude 3 Sonnet) | ![Bedrock](./screenshots/claude/aws-bedrock-claude.png) |
| Step Functions | ![Step Functions](./screenshots/aws/aws-stepfunctions.png) |
| API Gateway | ![API Gateway](./screenshots/aws/aws-apigateway.png) |
| Lambda | ![Lambda](./screenshots/aws/aws-lambda.png) |
| DynamoDB | ![DynamoDB](./screenshots/aws/aws-dynamodb.png) |
| S3 | ![S3](./screenshots/aws/aws-s3.png) |

---

## Security & Privacy

- **Explicit triggers only** — no proactive AI; user actions only.
- **Consent** — opt-in and opt-out at every stage.
- **Audit** — every action logged with provenance.
- **Source transparency** — assertions tagged [Public], [Proprietary], or [Inferred].
- **Encryption** — S3 and DynamoDB encryption at rest; Cognito on protected endpoints.
- **Public endpoint** — only `POST /sessions/:id/corrections` is unauthenticated (interviewee feedback).

---

## Project Structure

```
├── backend/                 # SAM template, Lambda, Step Functions
│   ├── template.yaml
│   ├── statemachine/
│   ├── layers/shared/
│   └── functions/
├── frontend/                # React app (Amplify-ready)
│   └── src/
│       ├── pages/
│       ├── components/
│       └── services/
├── screenshots/
│   ├── ui/                  # App UI screenshots
│   ├── aws/                 # AWS console evidence
│   └── claude/              # Bedrock/Claude evidence
├── scripts/                 # Deploy, credentials helpers
└── README.md
```

---

## Credits

Texas A&M University — Mays Business School · AWS AI Hackathon 2025

