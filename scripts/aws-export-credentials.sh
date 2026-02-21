#!/usr/bin/env bash
# Option A — Export in terminal (current session only)
# Copy your values from the event dashboard "Get AWS CLI credentials" or from aws_cli_cred.txt.
# Use us-east-1 for this app (Bedrock). Then run: source scripts/aws-export-credentials.sh

export AWS_DEFAULT_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="<your-access-key>"
export AWS_SECRET_ACCESS_KEY="<your-secret-key>"
export AWS_SESSION_TOKEN="<your-session-token>"

# After sourcing, verify with: aws sts get-caller-identity
