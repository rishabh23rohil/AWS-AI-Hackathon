# Texas Insights Engine — Complete AWS Setup Lab Manual

**AWS AI Hackathon 2025 | Mays Business School, Texas A&M University**

This guide walks you through every step to deploy the Texas Insights Engine on AWS, from scratch.
No prior AWS service experience required.

---

## Table of Contents

1. [Prerequisites & Account Setup](#1-prerequisites--account-setup)
2. [Install Required Tools](#2-install-required-tools)
3. [Enable Amazon Bedrock Model Access](#3-enable-amazon-bedrock-model-access)
4. [Deploy Backend with SAM](#4-deploy-backend-with-sam)
5. [Verify AWS Resources Created](#5-verify-aws-resources-created)
6. [Create Your First Cognito User](#6-create-your-first-cognito-user)
7. [Configure & Deploy Frontend](#7-configure--deploy-frontend)
8. [Test the End-to-End Flow](#8-test-the-end-to-end-flow)
9. [Optional: Enable Kendra](#9-optional-enable-kendra)
10. [Optional: Set Up SES for Emails](#10-optional-set-up-ses-for-emails)
11. [Demo Day Preparation](#11-demo-day-preparation)
12. [Troubleshooting Guide](#12-troubleshooting-guide)
13. [Cleanup (After Hackathon)](#13-cleanup-after-hackathon)
14. [Architecture Diagram Reference](#14-architecture-diagram-reference)
15. [Cost Monitoring](#15-cost-monitoring)

---

## 1. Prerequisites & Account Setup

### 1.1 AWS Account

You need an AWS account with hackathon credits. If your team was given access:

1. Go to https://console.aws.amazon.com/
2. Sign in with your hackathon credentials
3. **IMPORTANT**: Set your region to **us-east-1** (N. Virginia) — this is where Bedrock models are most available
4. In the top-right corner, confirm it says "N. Virginia"

### 1.2 IAM Permissions

Your user/role needs these permissions (if you're the account admin, you have all of these):

- `AmazonDynamoDBFullAccess`
- `AmazonS3FullAccess`
- `AWSLambda_FullAccess`
- `AmazonAPIGatewayAdministrator`
- `AWSStepFunctionsFullAccess`
- `AmazonCognitoPowerUser`
- `AmazonBedrockFullAccess`
- `AmazonComprehendFullAccess`
- `AmazonTextractFullAccess`
- `AWSCloudFormationFullAccess`
- `IAMFullAccess` (needed for SAM to create roles)

**Quick way**: If this is a hackathon account, attach the `AdministratorAccess` policy to your IAM user.

### 1.3 Install AWS CLI

If you don't have the AWS CLI installed:

**macOS:**
```bash
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

**Windows:**
Download from: https://awscli.amazonaws.com/AWSCLIV2.msi

**Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### 1.4 Configure AWS CLI

```bash
aws configure
```

Enter:
- **AWS Access Key ID**: (from your IAM user or hackathon credentials)
- **AWS Secret Access Key**: (from your IAM user or hackathon credentials)
- **Default region**: `us-east-1`
- **Output format**: `json`

**To get your Access Keys (if you don't have them):**
1. Go to AWS Console → IAM → Users → Your user
2. Click "Security credentials" tab
3. Under "Access keys", click "Create access key"
4. Choose "Command Line Interface (CLI)"
5. Download the CSV — you need the Access Key ID and Secret Access Key

Verify it works:
```bash
aws sts get-caller-identity
```
You should see your account ID and user ARN.

---

## 2. Install Required Tools

### 2.1 AWS SAM CLI

SAM (Serverless Application Model) deploys our Lambda functions, API Gateway, DynamoDB, etc.

**macOS:**
```bash
brew install aws-sam-cli
```

**Windows:**
Download from: https://github.com/aws/aws-sam-cli/releases/latest

**Linux:**
```bash
pip install aws-sam-cli
```

Verify:
```bash
sam --version
# Should show SAM CLI, version 1.x.x
```

### 2.2 Python 3.12

Our Lambda functions use Python 3.12.

```bash
python3 --version
# Needs to be 3.12.x
```

If not installed:
- macOS: `brew install python@3.12`
- Windows: Download from python.org
- Linux: `sudo apt install python3.12`

### 2.3 Node.js 18+ (for frontend)

```bash
node --version
# Needs to be 18.x or higher
```

If not installed:
- macOS: `brew install node`
- Windows: Download from nodejs.org
- All platforms: Use nvm (Node Version Manager)

---

## 3. Enable Amazon Bedrock Model Access

**This is critical — without this step, the AI won't work.**

1. Go to: https://console.aws.amazon.com/bedrock/home?region=us-east-1
2. In the left sidebar, click **"Model access"**
3. Click **"Manage model access"** (orange button, top right)
4. Find **"Anthropic"** in the list
5. Check the box for **"Claude 3 Sonnet"** (this is our primary model)
   - Also check **"Claude 3 Haiku"** as a backup (faster, cheaper)
6. Click **"Request model access"** (bottom of page)
7. Status should change to **"Access granted"** within a few seconds to minutes

**Verification:**
```bash
aws bedrock list-foundation-models --region us-east-1 --query "modelSummaries[?contains(modelId, 'claude')].modelId" --output table
```
You should see `anthropic.claude-3-sonnet-20240229-v1:0` in the list.

**If you see "Access denied"**: Some accounts need organization-level approval. Check with your hackathon admin.

---

## 4. Deploy Backend with SAM

### 4.1 Navigate to Backend Directory

```bash
cd /path/to/AI-AWS/backend
```

### 4.2 Build the SAM Application

This packages your Lambda functions and layer:

```bash
sam build
```

Expected output:
```
Building layer 'SharedLayer'
Building function 'CreateSessionFunction'
Building function 'GetSessionFunction'
... (more functions)
Build Succeeded
```

**If you see errors about Python 3.12**: Make sure Python 3.12 is installed and accessible.

### 4.3 Deploy to AWS

First-time deployment (interactive guided mode):

```bash
sam deploy --guided
```

It will ask you questions. Enter these answers:

| Question | Answer |
|----------|--------|
| Stack Name | `texas-insights-engine` |
| AWS Region | `us-east-1` |
| Parameter Stage | `dev` |
| Parameter EnableKendra | `false` (say `true` only if you want to pay ~$810/month) |
| Parameter FrontendUrl | `http://localhost:3000` (change later for production) |
| Confirm changes before deploy | `y` |
| Allow SAM CLI IAM role creation | `y` |
| Disable rollback | `n` |
| Save arguments to samconfig.toml | `y` |

SAM will show you a changeset of ALL resources it will create. Type `y` to confirm.

**Wait 3-5 minutes** for deployment. You'll see CloudFormation events scrolling by.

### 4.4 Record the Outputs

When deployment finishes, SAM prints output values. **Save these — you need them for the frontend:**

```
Key                 ApiUrl
Description         API Gateway URL
Value               https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev

Key                 UserPoolId
Description         Cognito User Pool ID
Value               us-east-1_XXXXXXXXX

Key                 UserPoolClientId
Description         Cognito User Pool Client ID
Value               xxxxxxxxxxxxxxxxxxxxxxxxxx

Key                 S3Bucket
Description         S3 Bucket Name
Value               tamu-insights-dev-123456789012
```

**Copy these values somewhere safe!**

### 4.5 Subsequent Deployments

After the first deploy, just run:
```bash
sam build && sam deploy
```

---

## 5. Verify AWS Resources Created

Open the AWS Console and verify each resource was created:

### 5.1 DynamoDB Tables
1. Go to: https://console.aws.amazon.com/dynamodb/home?region=us-east-1#tables
2. You should see 5 tables:
   - `texas-insights-interviews-dev`
   - `texas-insights-users-dev`
   - `texas-insights-audit-dev`
   - `texas-insights-engine-dev`
   - `texas-insights-consent-dev`

### 5.2 Lambda Functions
1. Go to: https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions
2. You should see 10 functions starting with `texas-insights-`

### 5.3 API Gateway
1. Go to: https://console.aws.amazon.com/apigateway/home?region=us-east-1#/apis
2. You should see `texas-insights-api-dev`
3. Click on it → Stages → dev → note the Invoke URL

### 5.4 Step Functions
1. Go to: https://console.aws.amazon.com/states/home?region=us-east-1#/statemachines
2. You should see `texas-insights-brief-pipeline-dev`
3. Click on it to see the visual workflow

### 5.5 S3 Bucket
1. Go to: https://console.aws.amazon.com/s3/home
2. You should see `tamu-insights-dev-{your-account-id}`

### 5.6 Cognito
1. Go to: https://console.aws.amazon.com/cognito/v2/idp/user-pools?region=us-east-1
2. You should see `texas-insights-dev-pool`

---

## 6. Create Your First Cognito User

You need a Cognito user to log into the app.

### Option A: AWS Console (Easy)

1. Go to Cognito → User Pools → `texas-insights-dev-pool`
2. Click the **"Users"** tab
3. Click **"Create user"**
4. Enter:
   - **Email address**: your email (e.g., `student@tamu.edu`)
   - **Temporary password**: Something like `TempPass123!`
   - Check "Mark email address as verified"
5. Click **Create user**

When you first log in via the app, it will ask you to change your password.

### Option B: AWS CLI

```bash
# Replace with your User Pool ID from the SAM outputs
USER_POOL_ID="us-east-1_XXXXXXXXX"

# Create user
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username "student@tamu.edu" \
  --user-attributes Name=email,Value="student@tamu.edu" Name=email_verified,Value=true Name=name,Value="Your Name" \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS

# Set permanent password (skip the temporary password flow)
aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username "student@tamu.edu" \
  --password "YourPermanentPass123!" \
  --permanent
```

---

## 7. Configure & Deploy Frontend

### 7.1 Set Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
cd /path/to/AI-AWS/frontend
```

Create the file `frontend/.env`:
```
REACT_APP_API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev
REACT_APP_AWS_REGION=us-east-1
REACT_APP_USER_POOL_ID=us-east-1_XXXXXXXXX
REACT_APP_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Replace the values** with the outputs from Step 4.4.

### 7.2 Install Dependencies & Run Locally

```bash
cd frontend
npm install
npm start
```

The app should open at http://localhost:3000

You'll see the Cognito login screen. Log in with the user you created in Step 6.

### 7.3 Deploy to AWS Amplify (Production)

#### Option A: Amplify Console (Recommended for Hackathon)

1. Go to: https://console.aws.amazon.com/amplify/home?region=us-east-1
2. Click **"New app"** → **"Host web app"**
3. Choose **"Deploy without Git provider"** (easiest for hackathon)
4. Build your frontend:
   ```bash
   cd frontend
   npm run build
   ```
5. Zip the build folder:
   ```bash
   cd build
   zip -r ../../frontend-build.zip .
   cd ../..
   ```
6. Drag and drop `frontend-build.zip` into the Amplify Console
7. Amplify gives you a URL like: `https://main.xxxxxxxxxxxx.amplifyapp.com`

#### Option B: Amplify CLI

```bash
npm install -g @aws-amplify/cli

cd frontend
amplify init
amplify add hosting
amplify publish
```

### 7.4 Update CORS for Production

Once you have the Amplify URL, update the backend to allow it:

```bash
cd backend
sam deploy --parameter-overrides FrontendUrl=https://main.xxxxxxxxxxxx.amplifyapp.com
```

---

## 8. Test the End-to-End Flow

### 8.1 Quick Smoke Test

1. **Open the app** at http://localhost:3000 (or your Amplify URL)
2. **Log in** with your Cognito credentials
3. **Create a session**:
   - Company Name: `Buc-ee's`
   - Leader Name: `Arch Aplin III`
   - Add URL: `https://www.buc-ees.com`
   - Click "Generate Intelligence Brief"
4. **Wait 30-60 seconds** — the status bar will show progress
5. **Review the brief** — you should see:
   - Company overview
   - "What We Think We Know" assertions with confidence tags
   - Question sequence with coaching cues
   - Interviewee packet
6. **Click "Send Pre-Packet"** (will create the feedback link)
7. **Open the feedback link** in an incognito window (simulates the interviewee)
8. **Submit corrections** (add 1-2 corrections, select 2-3 questions)
9. **Back in the main app**, click "Update Brief with Corrections"
10. **Click "Live Interview"** — see the full interview panel
11. **After the mock interview**, click "Post-Call Synthesis"
12. **Fill in notes** and generate the synthesis

### 8.2 Monitoring in AWS Console

During the test, you can watch the pipeline:

- **Step Functions**: Go to the state machine → Executions → click the running one. You'll see each step (Ingest → Generate → Quality Check) with green/red indicators.
- **CloudWatch Logs**: Each Lambda function logs to CloudWatch. Go to CloudWatch → Log groups → filter by `texas-insights`.
- **DynamoDB**: Go to the Interviews table → Explore items → filter by your session ID.

---

## 9. Optional: Enable Kendra

**Cost warning**: Kendra Developer Edition costs ~$810/month. Only enable if hackathon credits cover it.

### 9.1 Deploy with Kendra

```bash
cd backend
sam deploy --parameter-overrides EnableKendra=true
```

### 9.2 Index TAMU Documents

1. Go to: https://console.aws.amazon.com/kendra/home?region=us-east-1
2. Click on your index `texas-insights-kendra-dev`
3. Go to "Data sources" → `texas-insights-s3-source-dev`
4. Click "Sync now" (this indexes documents from S3)

### 9.3 Upload Documents to S3

Upload your TAMU documents (sector briefs, prior transcripts):

```bash
# Upload a PDF
aws s3 cp your-document.pdf s3://tamu-insights-dev-YOUR-ACCOUNT-ID/uploads/admin/documents/

# Upload multiple files
aws s3 sync ./tamu-docs/ s3://tamu-insights-dev-YOUR-ACCOUNT-ID/uploads/admin/documents/
```

Then sync Kendra again to index the new documents.

---

## 10. Optional: Set Up SES for Emails

SES (Simple Email Service) lets the app send actual emails to interviewees.

### 10.1 Verify Your Email

SES starts in "sandbox mode" — you can only send to verified emails.

1. Go to: https://console.aws.amazon.com/ses/home?region=us-east-1
2. Click **"Verified identities"** → **"Create identity"**
3. Choose **"Email address"**
4. Enter your email (e.g., `student@tamu.edu`)
5. Click **Create identity**
6. Check your email for a verification link and click it

### 10.2 For the Hackathon Demo

In sandbox mode, you also need to verify the recipient's email. Just verify both sender and recipient emails. The app will still show the "Send Packet" button and generate the feedback link regardless.

### 10.3 Production (Out of Sandbox)

To send to any email, request production access:
1. SES → Account dashboard → "Request production access"
2. Fill out the form (explain it's for academic interview prep)

---

## 11. Demo Day Preparation

### 11.1 Pre-Generate Demo Data

To ensure the demo runs smoothly (no waiting for Bedrock):

1. Create a session for your demo company the day before
2. Let the pipeline complete
3. Submit mock corrections
4. Update the brief

This way, during the demo, you can show the completed flow instantly.

### 11.2 Demo Script Technical Checklist

| # | Demo Step | What to Show | AWS Service Visible |
|---|-----------|--------------|-------------------|
| 1 | Problem | Google search for a company | N/A |
| 2 | Create Session | Enter company name, click Generate | API Gateway → Lambda → Step Functions |
| 3 | Brief Generated | Show full 2-3 page brief | S3 (stored), DynamoDB (metadata), Bedrock (generated) |
| 4 | Send Packet | Click Send, show interviewee view | SES (email), Cognito (auth) |
| 5 | Corrections | Submit corrections in interviewee form | DynamoDB (stored), API Gateway (public endpoint) |
| 6 | Update Brief | Click Update, show corrections highlighted | Bedrock (regenerated), S3 (new version) |
| 7 | Live Interview | Walk through interview panel | Real-time UX, merge/not-merge |
| 8 | Synthesis | Show post-call mapping | Bedrock (synthesis), DynamoDB (knowledge graph) |
| 9 | Governance | Show audit log, consent, transparency | DynamoDB (audit table), Cognito (auth) |

### 11.3 Backup Plan

If Bedrock is slow during the demo:
- Have pre-generated briefs cached in the app
- Show the Step Functions visual execution from a previous run
- Show the DynamoDB records directly

### 11.4 Talking Points for Judges

- **"Nothing happened without a human click"** — point to the explicit triggers
- **"Every assertion has a source tag"** — show [Public], [Inferred], [Proprietary]
- **"The AI was wrong, and that's the feature"** — show corrections as value, not bugs
- **"AWS-native from edge to AI"** — Amplify, Cognito, API Gateway, Lambda, Step Functions, Bedrock, Comprehend, Textract, Kendra, DynamoDB, S3

---

## 12. Troubleshooting Guide

### "sam build" fails

```
Error: PythonPipBuilder:ResolveDependencies
```
**Fix**: Make sure Python 3.12 is installed:
```bash
python3.12 --version
# If not found, install it
```

### "sam deploy" fails with "CREATE_FAILED"

Check the error in CloudFormation:
1. Go to: https://console.aws.amazon.com/cloudformation/home?region=us-east-1
2. Click on `texas-insights-engine`
3. Click "Events" tab
4. Find the red "CREATE_FAILED" event
5. Read the "Status reason"

Common issues:
- **"S3 bucket name already exists"**: Bucket names are globally unique. The template uses your account ID, but if you've deployed before, you may need to delete the old stack first.
- **"Role already exists"**: Delete the old stack and redeploy.

### Lambda function errors

Check CloudWatch Logs:
1. Go to: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups
2. Search for `texas-insights`
3. Click on the function's log group
4. Click on the latest log stream
5. Look for error messages

### Bedrock "Access Denied"

```
botocore.exceptions.ClientError: An error occurred (AccessDeniedException) when calling the InvokeModel operation
```
**Fix**: Go back to Step 3 and ensure Claude 3 Sonnet is enabled in Bedrock Model Access.

### CORS errors in the browser

If you see `Access-Control-Allow-Origin` errors:
1. Check that your `FrontendUrl` SAM parameter matches your actual frontend URL
2. Redeploy: `sam deploy --parameter-overrides FrontendUrl=http://localhost:3000`

### Step Functions execution failed

1. Go to Step Functions → your state machine → Executions
2. Click on the failed execution
3. Click on the red (failed) step
4. Expand "Error" and "Cause" to see the Lambda error

### Frontend login issues

- Make sure `.env` has the correct `REACT_APP_USER_POOL_ID` and `REACT_APP_USER_POOL_CLIENT_ID`
- Make sure the Cognito user is verified and has a permanent password
- Check browser console for errors

### "Internal Server Error" from API Gateway

1. Go to API Gateway → your API → Stages → dev
2. Enable CloudWatch logging:
   - Click "Logs/Tracing" tab
   - Enable "CloudWatch Logs"
   - Set log level to "INFO"
3. Retry the request and check CloudWatch for the API Gateway logs

---

## 13. Cleanup (After Hackathon)

**IMPORTANT**: Delete resources to avoid ongoing charges.

### Delete the SAM Stack

```bash
cd backend
sam delete --stack-name texas-insights-engine
```

This will prompt you to confirm. It deletes ALL resources (Lambda, API Gateway, DynamoDB, Cognito, etc.)

### Delete the S3 Bucket (if not empty)

SAM can't delete non-empty S3 buckets. Empty it first:

```bash
aws s3 rm s3://tamu-insights-dev-YOUR-ACCOUNT-ID --recursive
```

Then delete the stack again, or delete the bucket manually in the console.

### Delete Amplify App

Go to Amplify Console → your app → "Actions" → "Delete app"

### Verify Nothing is Running

```bash
# Check for remaining resources
aws cloudformation list-stacks --region us-east-1 --query "StackSummaries[?contains(StackName, 'texas-insights')]"
```

---

## 14. Architecture Diagram Reference

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                               │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │  AWS Amplify (React Web App)                                     │  │
│   │  - Dashboard / Create Session / Brief Viewer / Interview Panel   │  │
│   │  - Interviewee Feedback Form (public, no auth)                   │  │
│   └────────────────────────────┬─────────────────────────────────────┘  │
│                                │                                        │
│                     ┌──────────▼──────────┐                             │
│                     │  Amazon Cognito      │                             │
│                     │  (Authentication)    │                             │
│                     └──────────┬──────────┘                             │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────────┐
│                           API LAYER                                     │
│   ┌────────────────────────────────────────────────────────────────┐    │
│   │  Amazon API Gateway (REST)                                     │    │
│   │  POST /sessions          GET /sessions          GET /sessions/{id}│ │
│   │  POST /sessions/{id}/send-packet                               │    │
│   │  POST /sessions/{id}/corrections  (no auth - public)           │    │
│   │  POST /sessions/{id}/update-brief                              │    │
│   │  POST /sessions/{id}/synthesis                                 │    │
│   └──────────────────────────┬─────────────────────────────────────┘    │
└──────────────────────────────┼──────────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────────┐
│                      ORCHESTRATION LAYER                                │
│                                                                         │
│   ┌───────────────────────────────────────────────────────────────────┐ │
│   │  AWS Step Functions (Brief Generation Pipeline)                   │ │
│   │                                                                   │ │
│   │  ┌──────────┐   ┌──────────────┐   ┌──────────────┐              │ │
│   │  │ Ingest   │──▶│ Generate     │──▶│ Quality      │──▶ Success   │ │
│   │  │ Sources  │   │ Brief        │   │ Check        │              │ │
│   │  │ (Lambda) │   │ (Lambda)     │   │ (Lambda)     │              │ │
│   │  └──────────┘   └──────────────┘   └──────┬───────┘              │ │
│   │                                           │ Fail                  │ │
│   │                                           ▼                       │ │
│   │                                    ┌──────────────┐               │ │
│   │                                    │ Regenerate   │──▶ Success    │ │
│   │                                    │ Brief        │               │ │
│   │                                    └──────────────┘               │ │
│   └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────────┐
│                      INTELLIGENCE LAYER                                 │
│                                                                         │
│   ┌───────────────┐  ┌────────────────┐  ┌──────────────────────────┐  │
│   │ Amazon Bedrock │  │ Amazon Kendra  │  │ Amazon Comprehend        │  │
│   │ (Claude 3)     │  │ (RAG Index)    │  │ (Entity Extraction, PII) │  │
│   │                │  │ Optional       │  │                          │  │
│   │ - Profiles     │  │ - TAMU docs    │  │ - Entities               │  │
│   │ - Questions    │  │ - Semantic     │  │ - Key phrases            │  │
│   │ - Briefs       │  │   search       │  │ - PII detection          │  │
│   │ - Synthesis    │  │                │  │                          │  │
│   └───────────────┘  └────────────────┘  └──────────────────────────┘  │
│                                                                         │
│   ┌───────────────────────┐                                             │
│   │ Amazon Textract        │                                             │
│   │ (PDF/Document Parsing) │                                             │
│   └───────────────────────┘                                             │
└─────────────────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────────┐
│                        STORAGE LAYER                                    │
│                                                                         │
│   ┌───────────────────────┐    ┌────────────────────────────────────┐   │
│   │ Amazon S3              │    │ Amazon DynamoDB                    │   │
│   │                        │    │                                    │   │
│   │ /uploads/              │    │ Interviews (PK: INTERVIEW#{id})    │   │
│   │ /extracted/            │    │ Users      (PK: USER#{id})         │   │
│   │ /briefs/{id}/{ver}/    │    │ AuditLog   (PK: AUDIT#{date})     │   │
│   │ /packets/{id}/         │    │ InsightsEngine (PK: COMPANY#{n})  │   │
│   │ /notes/{id}/           │    │ Consent    (PK: CONSENT#{email})  │   │
│   │ /synthesis/{id}/{ver}/ │    │                                    │   │
│   │ /audit/{date}/         │    │ All tables: encryption at rest     │   │
│   │                        │    │ Point-in-time recovery enabled     │   │
│   │ SSE-AES256 encryption  │    │                                    │   │
│   └───────────────────────┘    └────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 15. Cost Monitoring

### Set Up a Budget Alert

1. Go to: https://console.aws.amazon.com/billing/home#/budgets
2. Click "Create budget"
3. Choose "Cost budget"
4. Set amount: `$30` (for hackathon)
5. Add your email for alerts at 50%, 80%, and 100%

### Current Cost Estimates

| Service | Hackathon Usage | Cost |
|---------|----------------|------|
| Bedrock (Claude Sonnet) | ~100 brief generations | $15-25 |
| DynamoDB | On-demand, <100 writes | <$1 |
| S3 | <1 GB | <$0.03 |
| Lambda | <10K invocations | Free tier |
| API Gateway | <10K requests | Free tier |
| Cognito | <50K MAU | Free tier |
| Amplify Hosting | 1 app | Free tier |
| **Total** | | **$15-30** |

### Check Current Spend

```bash
aws ce get-cost-and-usage \
  --time-period Start=2025-03-01,End=2025-03-31 \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --query "ResultsByTime[0].Total.UnblendedCost"
```

---

## Quick Reference Card

| What | Where |
|------|-------|
| Frontend | `http://localhost:3000` or Amplify URL |
| API | `https://xxxx.execute-api.us-east-1.amazonaws.com/dev` |
| Bedrock Console | https://console.aws.amazon.com/bedrock/ |
| DynamoDB Console | https://console.aws.amazon.com/dynamodb/ |
| Step Functions Console | https://console.aws.amazon.com/states/ |
| CloudWatch Logs | https://console.aws.amazon.com/cloudwatch/ |
| S3 Console | https://console.aws.amazon.com/s3/ |
| Cognito Console | https://console.aws.amazon.com/cognito/ |
| API Gateway Console | https://console.aws.amazon.com/apigateway/ |

---

**You're all set! Go win that hackathon.**
