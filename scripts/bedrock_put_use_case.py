#!/usr/bin/env python3
"""
Submit Anthropic first-time use case for Bedrock (boto3).
Per AWS/Stack Overflow: formData must NOT be base64-encoded when using boto3.
Run with AWS creds and region us-east-1 (e.g. source scripts/set-aws-from-cred-file.sh first).
"""
import json
import boto3

FORM_DATA = {
    "companyName": "Texas A&M Mays - Texas Insights Engine",
    "companyWebsite": "https://www.mays.tamu.edu",
    "intendedUsers": "0",  # 0=Internal, 1=External, 2=Both
    "industryOption": "Education",
    "otherIndustryOption": "",
    "useCases": "Academic interview preparation and business intelligence. AWS AI Hackathon 2025.",
}

def main():
    client = boto3.client("bedrock", region_name="us-east-1")
    # API expects formData as JSON string (no base64 when using SDK)
    form_data_json = json.dumps(FORM_DATA)
    client.put_use_case_for_model_access(formData=form_data_json)
    print("PutUseCaseForModelAccess succeeded.")

if __name__ == "__main__":
    main()
