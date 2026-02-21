export const COMPONENT_BREAKDOWN = [
  {
    name: "API Gateway",
    responsibility: "REST API entrypoint; routes to Lambda; validates Cognito JWT for protected routes.",
    why: "Single public endpoint; CORS; rate shaping; no long-lived servers.",
    scaling: "Managed; scales automatically with request count.",
    failure: "5xx if Lambda fails or throttles; 4xx for auth/validation.",
  },
  {
    name: "Lambda",
    responsibility: "All business logic: create_session, ingest_sources, generate_brief, quality_check, send_packet, submit_corrections, update_brief, post_call_synthesis.",
    why: "Serverless; pay per execution; no idle cost; IAM-scoped per function.",
    scaling: "Concurrency per account/function; scales with invocations.",
    failure: "Timeouts (120–300s); retries at Step Functions or client; partial failure in ingest (per-URL).",
  },
  {
    name: "Step Functions",
    responsibility: "Orchestrates brief pipeline: IngestSources → GenerateBrief → QualityCheck → EvaluateQuality → BriefReady or RegenerateBrief.",
    why: "Visible state machine; retries and catch per state; audit trail in console.",
    scaling: "Concurrent executions; no limit for standard workflow.",
    failure: "Fail states (IngestionFailed, GenerationFailed, QualityCheckFailed); no automatic retry of entire run.",
  },
  {
    name: "Bedrock",
    responsibility: "Claude 3 Sonnet: company profile, questions, interviewer brief, interviewee packet, post-call synthesis.",
    why: "Managed GenAI; no model hosting; same region (us-east-1); data stays in AWS.",
    scaling: "Model quotas; throttling handled by Lambda retries.",
    failure: "Throttling → retry; model errors → Lambda fails and Step Function catches.",
  },
  {
    name: "DynamoDB",
    responsibility: "Interviews table (PK/SK, GSI1 for user list); brief metadata; corrections; synthesis; audit log; insights engine.",
    why: "Single-digit ms; PAY_PER_REQUEST; point-in-time recovery; encryption.",
    scaling: "No capacity planning; scales with read/write.",
    failure: "Conditional check failures; throttling (rare with on-demand); application retries.",
  },
  {
    name: "S3",
    responsibility: "uploads/, extracted/, briefs/, packets/, notes/, synthesis/; versioned briefs (v1, v2…).",
    why: "Durable; presigned URLs for upload; versioning for brief history.",
    scaling: "Unlimited; no throughput limits.",
    failure: "Access denied; key not found; Lambda retries on transient errors.",
  },
  {
    name: "SES",
    responsibility: "Sends email to interviewee with feedback link (optional).",
    why: "Managed email; no SMTP server; compliant.",
    scaling: "Account limits; increase via support.",
    failure: "Bounces; rate limits; Lambda returns 4xx/5xx.",
  },
];

export const STATE_MACHINE_STATES = [
  { state: "IngestSources", type: "Task", next: "GenerateBrief", retry: "Lambda 3× (2s, backoff 2)", catch: "IngestionFailed" },
  { state: "GenerateBrief", type: "Task", next: "QualityCheck", retry: "Lambda 2× (5s, backoff 2)", catch: "GenerationFailed" },
  { state: "QualityCheck", type: "Task", next: "EvaluateQuality", retry: "Lambda 2×", catch: "QualityCheckFailed" },
  { state: "EvaluateQuality", type: "Choice", next: "BriefReady if passed; RegenerateBrief if not", retry: "—", catch: "—" },
  { state: "RegenerateBrief", type: "Task", next: "BriefReady", retry: "—", catch: "—" },
  { state: "BriefReady", type: "Succeed", next: "—", retry: "—", catch: "—" },
  { state: "IngestionFailed", type: "Fail", next: "—", retry: "—", catch: "—" },
  { state: "GenerationFailed", type: "Fail", next: "—", retry: "—", catch: "—" },
  { state: "QualityCheckFailed", type: "Fail", next: "—", retry: "—", catch: "—" },
];

export const DATA_MODEL = {
  dynamoDB: `InterviewsTable:
  PK (S): "INTERVIEW#<sessionId>"
  SK (S): "META" | "BRIEF#<version>" | "CORRECTION#<index>" | "SYNTHESIS#<version>"
  GSI1: GSI1PK = "USER#<userId>", GSI1SK = <created> (list sessions)`,
  s3: `Prefixes:
  uploads/{userId}/{sessionId}/document.pdf
  extracted/{sessionId}/chunks.json, textract_output.txt
  briefs/{sessionId}/v1|v2|.../interviewer_brief.json, company_profile.json, questions.json
  packets/{sessionId}/interviewee_packet.json
  notes/{sessionId}/interview_notes.json
  synthesis/{sessionId}/v{n}/synthesis.json`,
  versioning: "Brief versions: v1 from pipeline; v2, v3... from Update Brief. Each version has its own S3 prefix and DynamoDB BRIEF# item.",
};

export const API_CONTRACTS = [
  { method: "POST", path: "/sessions", auth: "Cognito", in: "companyName, leaderName, intervieweeEmail?, urls[], hasPdfUpload?", out: "sessionId, status, uploadUrl?" },
  { method: "GET", path: "/sessions/{sessionId}", auth: "Cognito", in: "—", out: "interview + brief metadata" },
  { method: "GET", path: "/sessions", auth: "Cognito", in: "—", out: "sessions[]" },
  { method: "POST", path: "/sessions/{sessionId}/send-packet", auth: "Cognito", in: "intervieweeEmail?, deliveryMethod?, feedbackBaseUrl?", out: "200" },
  { method: "POST", path: "/sessions/{sessionId}/corrections", auth: "None (public)", in: "corrections[], selectedQuestions[], optOut?", out: "message" },
  { method: "POST", path: "/sessions/{sessionId}/update-brief", auth: "Cognito", in: "—", out: "brief version" },
  { method: "POST", path: "/sessions/{sessionId}/synthesis", auth: "Cognito", in: "corrections, keyInsights, surprises, constraints, ...", out: "synthesis" },
];
