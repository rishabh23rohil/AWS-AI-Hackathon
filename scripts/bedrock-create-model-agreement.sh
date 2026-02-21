#!/usr/bin/env bash
# Create the foundation model agreement (required after use-case form).
# Requires IAM permission: aws-marketplace:Subscribe (and ViewSubscriptions).
# Run from project root with creds that have Marketplace access (e.g. account admin):
#   source scripts/set-aws-from-cred-file.sh   # or use admin profile
#   ./scripts/bedrock-create-model-agreement.sh
#
# Optional: use a different model (must match backend template.yaml BEDROCK_MODEL_ID):
#   BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0 ./scripts/bedrock-create-model-agreement.sh
#   (Claude 3 Haiku = Marketplace prod-ozonys2hmmpeu)

set -e

MODEL_ID="${BEDROCK_MODEL_ID:-anthropic.claude-3-sonnet-20240229-v1:0}"
REGION="${AWS_DEFAULT_REGION:-us-east-1}"

echo "Listing agreement offers for $MODEL_ID..."
OFFER_TOKEN=$(aws bedrock list-foundation-model-agreement-offers \
  --region "$REGION" \
  --model-id "$MODEL_ID" \
  --offer-type ALL \
  --query 'offers[0].offerToken' \
  --output text)

if [[ -z "$OFFER_TOKEN" || "$OFFER_TOKEN" == "None" ]]; then
  echo "No offer found for model $MODEL_ID"
  exit 1
fi

echo "Creating foundation model agreement..."
aws bedrock create-foundation-model-agreement \
  --region "$REGION" \
  --model-id "$MODEL_ID" \
  --offer-token "$OFFER_TOKEN"

echo "Done. Check with: aws bedrock get-foundation-model-availability --region $REGION --model-id $MODEL_ID"
