#!/usr/bin/env bash
# Submit Anthropic first-time use case for Bedrock model access.
# Run from project root after: source scripts/set-aws-from-cred-file.sh
# Usage: ./scripts/bedrock-put-use-case.sh

set -e

# Form fields must match API: intendedUsers as string "0"|"1"|"2", companyWebsite often with www
JSON='{"companyName":"Texas A&M Mays - Texas Insights Engine","companyWebsite":"https://www.mays.tamu.edu","intendedUsers":"0","industryOption":"Education","otherIndustryOption":"","useCases":"Academic interview preparation and business intelligence. AWS AI Hackathon 2025."}'

DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
OUT="$DIR/../.bedrock-ftu.b64"

echo "$JSON" | base64 | tr -d '\n' > "$OUT"
echo "Calling PutUseCaseForModelAccess (us-east-1)..."
aws bedrock put-use-case-for-model-access --region us-east-1 --form-data "fileb://$OUT"
echo "Done."
rm -f "$OUT"
