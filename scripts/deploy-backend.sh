#!/usr/bin/env bash
# Run from project root (AI-AWS). Requires AWS credentials and SAM CLI.
# 1. Set credentials: source scripts/set-aws-from-cred-file.sh
# 2. Install SAM CLI if needed: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
# 3. Run: ./scripts/deploy-backend.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${SCRIPT_DIR}/../backend"
cd "$BACKEND_DIR"

if ! command -v sam &>/dev/null; then
  echo "SAM CLI not found. Install from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
  exit 1
fi

echo "Running sam build..."
sam build

echo "Run the following to deploy (guided prompts):"
echo "  cd backend && sam deploy --guided"
echo "Use: Stack name texas-insights-engine, Region us-east-1, Stage dev, EnableKendra false, FrontendUrl http://localhost:3000"
echo "Then record outputs: ApiUrl, UserPoolId, UserPoolClientId, S3Bucket"
