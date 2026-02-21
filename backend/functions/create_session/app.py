import json
import uuid
import os
import boto3
from shared import DynamoDBClient, S3Client, AuditLogger, api_response

sfn = boto3.client("stepfunctions")
db = DynamoDBClient()
s3 = S3Client()
audit = AuditLogger()

STATE_MACHINE_ARN = os.environ.get("STATE_MACHINE_ARN", "")
MAX_BRIEFS_PER_DAY = 5


def handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        user_email = event["requestContext"]["authorizer"]["claims"]["email"]

        company_name = body.get("companyName", "").strip()
        leader_name = body.get("leaderName", "").strip()
        interviewee_email = body.get("intervieweeEmail", "").strip()
        urls = body.get("urls", [])
        has_pdf = body.get("hasPdfUpload", False)

        if not company_name:
            return api_response(400, {"error": "companyName is required"})

        session_id = uuid.uuid4().hex[:12]

        interview = db.create_interview(session_id, {
            "companyName": company_name,
            "leaderName": leader_name,
            "interviewerId": user_id,
            "interviewerEmail": user_email,
            "intervieweeEmail": interviewee_email,
            "urls": urls,
        })

        upload_url = None
        if has_pdf:
            upload_key = f"uploads/{user_id}/{session_id}/document.pdf"
            upload_url = s3.generate_upload_url(upload_key)

        audit.log(
            user_id=user_id,
            action="CREATE_SESSION",
            resource_id=session_id,
            sources=urls,
            metadata={"companyName": company_name, "leaderName": leader_name},
        )

        sfn_input = {
            "sessionId": session_id,
            "companyName": company_name,
            "leaderName": leader_name,
            "urls": urls,
            "userId": user_id,
            "hasPdf": has_pdf,
        }
        sfn.start_execution(
            stateMachineArn=STATE_MACHINE_ARN,
            name=f"brief-{session_id}",
            input=json.dumps(sfn_input),
        )

        db.update_interview_status(session_id, "generating")

        return api_response(201, {
            "sessionId": session_id,
            "status": "generating",
            "uploadUrl": upload_url,
            "message": "Session created. Brief generation started.",
        })

    except Exception as e:
        print(f"Error: {e}")
        return api_response(500, {"error": str(e)})
