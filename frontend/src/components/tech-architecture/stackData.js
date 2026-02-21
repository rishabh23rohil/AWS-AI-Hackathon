export const STACK_ITEMS = [
  { names: ["React", "Amplify"], purpose: "UI and hosting; Cognito sign-in.", why: "Amplify Hosting + Cognito out of the box; React for dashboard and feedback flows." },
  { names: ["API Gateway", "Cognito"], purpose: "REST API and JWT auth for interviewers.", why: "Managed API; no servers; JWT validation at edge." },
  { names: ["Lambda", "Step Functions"], purpose: "All business logic and pipeline orchestration.", why: "Serverless compute and workflow; pay per use; visible state machine." },
  { names: ["Bedrock", "Claude 3 Sonnet"], purpose: "Company profile, questions, brief, packet, synthesis.", why: "Managed GenAI in-region; no model hosting." },
  { names: ["Comprehend", "Textract"], purpose: "Entities/key phrases from URLs; text from PDFs.", why: "Managed NLP and document extraction; no custom ML." },
  { names: ["DynamoDB", "S3"], purpose: "Sessions, briefs, corrections, audit; files and artifacts.", why: "DynamoDB for metadata and queries; S3 for objects and versioning." },
  { names: ["SES"], purpose: "Email delivery for interviewee packet link.", why: "Managed email; no SMTP; compliant." },
];
