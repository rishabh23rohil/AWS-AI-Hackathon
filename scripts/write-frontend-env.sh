#!/usr/bin/env bash
# Write frontend/.env from SAM deploy outputs.
# Run from project root after sam deploy. You can get values from AWS Console:
#   ApiUrl: CloudFormation stack texas-insights-engine -> Outputs -> ApiUrl
#   UserPoolId, UserPoolClientId: Cognito -> User Pools -> texas-insights-dev-pool

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../frontend/.env"

read -p "REACT_APP_API_URL (e.g. https://xxx.execute-api.us-east-1.amazonaws.com/dev): " API_URL
read -p "REACT_APP_USER_POOL_ID (e.g. us-east-1_XXXXXXXXX): " POOL_ID
read -p "REACT_APP_USER_POOL_CLIENT_ID: " CLIENT_ID

cat > "$ENV_FILE" << EOF
REACT_APP_API_URL=${API_URL}
REACT_APP_AWS_REGION=us-east-1
REACT_APP_USER_POOL_ID=${POOL_ID}
REACT_APP_USER_POOL_CLIENT_ID=${CLIENT_ID}
EOF

echo "Wrote $ENV_FILE. Run: cd frontend && npm install && npm start"
