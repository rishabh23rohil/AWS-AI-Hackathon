# Screenshots for Tech & Architecture (and LinkedIn)

Place your AWS console and CLI screenshots here. The **Tech & Architecture** tab in the app displays images from this folder.

## Naming (use exactly)

| Filename | What to capture | Used for |
|----------|-----------------|----------|
| `aws_cli_bedrock_claude3_sonnet_availability.png` | Terminal: `aws bedrock get-foundation-model-availability --region us-east-1 --model-id "anthropic.claude-3-sonnet-20240229-v1"` showing AUTHORIZED / AVAILABLE | Proves Bedrock + Claude 3 Sonnet setup |
| `step_functions_brief_pipeline.png` | Step Functions console: state machine run showing IngestSources → GenerateBrief → QualityCheck → EvaluateQuality → BriefReady (and fail states) | Full brief-generation pipeline flow |

## Optional (recommended for judges / LinkedIn)

| Filename | What to capture |
|----------|-----------------|
| `api_gateway_endpoints.png` | API Gateway console: REST API with /sessions, /send-packet, /corrections, etc. |
| `cognito_user_pool.png` | Cognito User Pool (e.g. app client, sign-in) |
| `dynamodb_tables.png` | DynamoDB: table(s) used for interviews/briefs |
| `lambda_functions_list.png` | Lambda console: list of functions (create_session, ingest_sources, generate_brief, etc.) |
| `s3_bucket_structure.png` | S3 bucket: folders like uploads/, briefs/, packets/, extracted/ |
| `bedrock_model_access.png` | Bedrock → Model access: Claude 3 Sonnet (and optionally others) enabled |

Images in this folder are served at `/screenshot/<filename>` and shown on the **Tech & Architecture** page.
