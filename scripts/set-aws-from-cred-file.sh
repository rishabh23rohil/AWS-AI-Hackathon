#!/usr/bin/env bash
# Source aws_cli_cred.txt from project root and force us-east-1 (required for Bedrock).
# From project root (AI-AWS): source scripts/set-aws-from-cred-file.sh

# When sourced from bash, BASH_SOURCE[0] is the script path; in zsh it's unset so use project root (pwd when run from AI-AWS).
if [[ -n "${BASH_SOURCE[0]:-}" ]]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  ROOT="${SCRIPT_DIR}/.."
else
  ROOT="$(pwd)"
fi
# Prefer _local (gitignored); fallback to project root for backward compatibility
CRED_FILE="${ROOT}/_local/aws_cli_cred.txt"
[[ -f "$CRED_FILE" ]] || CRED_FILE="${ROOT}/aws_cli_cred.txt"
if [[ -f "$CRED_FILE" ]]; then
  set -a
  source "$CRED_FILE"
  set +a
  export AWS_DEFAULT_REGION="us-east-1"
  echo "AWS credentials loaded; region set to us-east-1. Verify with: aws sts get-caller-identity"
else
  echo "Not found: _local/aws_cli_cred.txt. Copy credentials into _local/aws_cli_cred.txt or use scripts/aws-export-credentials.sh"
fi
