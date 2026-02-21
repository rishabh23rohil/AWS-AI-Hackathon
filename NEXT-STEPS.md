# Next Steps (after AWS CLI works)

Your credentials are working. Do the following in order.

---

## 1. Install SAM CLI (one-time; requires your Mac password)

If you see "This package requires Rosetta 2", install Rosetta first (agree when prompted):

```bash
sudo softwareupdate --install-rosetta
```

Then install SAM CLI:

```bash
sudo installer -pkg /tmp/aws-sam-cli-macos-arm64.pkg -target /
```

Then verify:

```bash
sam --version
```

**Note:** The backend uses **Python 3.9** (matches macOS system Python). If you ever see a "python3.12" build error, the template has been set to 3.9 so `sam build` works without installing another Python.

---

## 2. Load credentials and deploy the backend

In the **same terminal** (or re-load creds in a new one):

```bash
cd /Users/rohil/Downloads/AI-AWS
source aws_cli_cred.txt
export AWS_DEFAULT_REGION="us-east-1"

./scripts/deploy-backend.sh
cd backend && sam deploy --guided
```

A **samconfig.toml** is already in `backend/` with the correct values (stack name **texas-insights-engine**, region **us-east-1**, Stage=dev, etc.). So you can either:

- Run **`sam deploy`** (no `--guided`) and it will use the config and prompt only for confirming the changeset, or  
- Run **`sam deploy --guided`** and accept the pre-filled defaults (stack name `texas-insights-engine`, region `us-east-1`, etc.).

If you already started a deploy with a different stack name (e.g. "AI"), press **Ctrl+C**, then run **`sam deploy`** from the `backend/` folder so it uses the correct stack name from samconfig.toml.

After deploy finishes, copy the **Outputs**: **ApiUrl**, **UserPoolId**, **UserPoolClientId**.

---

## 3. Configure frontend and start the app

```bash
cd /Users/rohil/Downloads/AI-AWS
./scripts/write-frontend-env.sh
```

Paste the ApiUrl, UserPoolId, and UserPoolClientId when asked.

Then:

```bash
cd frontend && npm install && npm start
```

Browser will open at http://localhost:3000.

---

## 4. Create a Cognito user

- AWS Console → **Cognito** → **User pools** → **texas-insights-dev-pool** → **Users** → **Create user**
- Email + temporary password, mark email verified

---

## 5. Bedrock model access (Claude 3 Sonnet)

The **use case form** is already submitted (via `scripts/bedrock_put_use_case.py`). To get **agreementAvailability: AVAILABLE** you must create the foundation model agreement. That step requires **aws-marketplace:Subscribe** (and ViewSubscriptions). The hackathon role **WSParticipantRole** does not have this permission.

**Option A – Account/admin with Marketplace access**

Run (with creds that have `aws-marketplace:Subscribe`):

```bash
source scripts/set-aws-from-cred-file.sh   # or admin profile
./scripts/bedrock-create-model-agreement.sh
```

**Option B – Bedrock console**

1. AWS Console → **Bedrock** (region **us-east-1**) → **Model access** (left pane).
2. **Modify model access** → enable **Anthropic → Claude 3 Sonnet**.
3. If prompted, submit use case details (already done once); then accept terms and submit.

After the agreement exists, `get-foundation-model-availability` will show `agreementAvailability.status: AVAILABLE`. Then brief generation in the app will work.

---

## 6. Test

Sign in at http://localhost:3000, create a session (company name + optional URL), generate the brief.
