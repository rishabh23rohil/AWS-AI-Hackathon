export const EVIDENCE_ITEMS = [
  { filename: "aws_cli_bedrock_claude3_sonnet_availability.png", title: "Bedrock · Claude 3 Sonnet", what: "CLI verification: Claude 3 Sonnet authorized and available in us-east-1. Model used for all brief and synthesis generation.", region: "us-east-1", service: "Bedrock" },
  { filename: "step_functions_brief_pipeline.png", title: "Step Functions · Pipeline", what: "State machine: IngestSources → GenerateBrief → QualityCheck → EvaluateQuality → BriefReady (with optional Regenerate). Retries and catch to Fail states.", region: "us-east-1", service: "Step Functions" },
  { filename: "api_gateway_endpoints.png", title: "API Gateway", what: "REST routes for sessions, send-packet, corrections, update-brief, synthesis. Cognito authorizer on protected routes.", region: "us-east-1", service: "API Gateway" },
  { filename: "lambda_functions_list.png", title: "Lambda", what: "All backend functions deployed with SAM: create_session, ingest, generate_brief, quality_check, send_packet, submit_corrections, update_brief, post_call_synthesis.", region: "us-east-1", service: "Lambda" },
  { filename: "dynamodb_tables.png", title: "DynamoDB", what: "Interview metadata, brief versions, corrections, synthesis, audit log. GSI for listing sessions by user.", region: "us-east-1", service: "DynamoDB" },
  { filename: "s3_bucket_structure.png", title: "S3", what: "Prefixes: uploads/, extracted/, briefs/, packets/, notes/, synthesis/. Versioned briefs.", region: "us-east-1", service: "S3" },
];
