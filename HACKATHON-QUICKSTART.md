# Hackathon Quick Start

Follow the full [AWS-SETUP-GUIDE.md](AWS-SETUP-GUIDE.md) or the Hackathon Setup Manual plan for details. This page is a short checklist.

## 1. Set AWS credentials (us-east-1)

From project root:

```bash
source scripts/set-aws-from-cred-file.sh
```

Or paste the export block from the plan and set `AWS_DEFAULT_REGION=us-east-1`. Then:

```bash
aws sts get-caller-identity
```

## 2. (Optional) Code Server and mykey.pem

- **Code Server**: AWS Console (us-east-1) → CloudFormation → `code-server-stack` → Outputs → open `CodeServerCloudFrontDomainName`, password = `CodeServerPassWord`.
- **SSH**: `chmod 400 ~/Downloads/mykey.pem` then `ssh -i ~/Downloads/mykey.pem ec2-user@<instance-public-ip>`. Use Code Server terminal and add credentials there the same way as step 1.

## 3. Enable Bedrock (us-east-1)

Console → Amazon Bedrock → Model access → Manage model access → enable **Anthropic → Claude 3 Sonnet** (or Enable all models). Wait for "Access granted".

## 4. Install tools

- **Mac**: Install [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html), Python 3.12, Node.js 18+.
- **Code Server**: SAM CLI and Python pre-installed; install Node if needed (`sudo yum install nodejs` or nvm).

## 5. Deploy backend

```bash
source scripts/set-aws-from-cred-file.sh   # if not already set
./scripts/deploy-backend.sh               # runs sam build
cd backend && sam deploy --guided
```

Use: Stack name `texas-insights-engine`, Region `us-east-1`, Stage `dev`, EnableKendra `false`, FrontendUrl `http://localhost:3000`. Save outputs: **ApiUrl**, **UserPoolId**, **UserPoolClientId**.

## 6. Configure frontend

Either run the helper (from project root):

```bash
./scripts/write-frontend-env.sh
```

Or manually:

```bash
cd frontend
cp .env.example .env
```

Edit `.env` with the SAM outputs:

```
REACT_APP_API_URL=<ApiUrl>
REACT_APP_AWS_REGION=us-east-1
REACT_APP_USER_POOL_ID=<UserPoolId>
REACT_APP_USER_POOL_CLIENT_ID=<UserPoolClientId>
```

Then:

```bash
npm install
npm start
```

## 7. Create Cognito user

Console (us-east-1) → Cognito → User Pools → `texas-insights-dev-pool` → Users → Create user (email, temporary password, email verified).

## 8. Test

Open http://localhost:3000, sign in, create a session (company name + optional URL), wait for brief, then try Send Pre-Packet and feedback link.
