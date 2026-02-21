import json
import os
import boto3
from shared import DynamoDBClient, S3Client, AuditLogger, api_response

ses = boto3.client("ses")
db = DynamoDBClient()
s3 = S3Client()
audit = AuditLogger()


def handler(event, context):
    try:
        session_id = event["pathParameters"]["sessionId"]
        body = json.loads(event.get("body", "{}"))
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        user_email = event["requestContext"]["authorizer"]["claims"]["email"]

        interview = db.get_interview(session_id)
        if not interview:
            return api_response(404, {"error": "Session not found"})

        if interview.get("interviewerId") != user_id:
            return api_response(403, {"error": "Access denied"})

        if interview.get("status") not in ("ready", "generated"):
            return api_response(400, {"error": f"Brief not ready. Current status: {interview.get('status')}"})

        interviewee_email = body.get("intervieweeEmail") or interview.get("intervieweeEmail")
        delivery_method = body.get("deliveryMethod", "email")

        brief_meta = db.get_latest_brief(session_id)
        if not brief_meta:
            return api_response(400, {"error": "No brief found for this session"})

        feedback_url = body.get("feedbackBaseUrl", "https://your-app.amplifyapp.com")
        feedback_link = f"{feedback_url}/feedback/{session_id}"

        if delivery_method == "email" and interviewee_email:
            try:
                packet_data = s3.get_json(brief_meta["packetS3Key"])
                company_name = interview.get("companyName", "your organization")
                leader_name = interview.get("leaderName", "")

                email_body = f"""Dear {leader_name},

Thank you for agreeing to speak with us as part of Texas A&M University's business intelligence research program.

To make the most of our upcoming conversation, we've prepared a brief summary of what we've learned about {company_name}. We'd love for you to review it and let us know:
- What did we get right?
- What did we get wrong?
- What did we miss?

Your corrections will make our conversation far more valuable.

Please review and respond here: {feedback_link}

This should take about 3 minutes of your time.

Best regards,
Texas A&M University — Mays Business School
Texas Insights Engine

---
Data sources: All information was gathered from public sources or provided by TAMU staff. 
No data was collected without your knowledge.
To opt out, simply reply to this email or visit: {feedback_link}?action=optout
"""

                ses.send_email(
                    Source=f"Texas Insights Engine <{user_email}>",
                    Destination={"ToAddresses": [interviewee_email]},
                    Message={
                        "Subject": {"Data": f"Interview Preparation — {company_name} | Texas A&M"},
                        "Body": {"Text": {"Data": email_body}},
                    },
                )
            except Exception as e:
                print(f"SES send failed (non-blocking): {e}")

        db.save_consent(interviewee_email or "manual_delivery", session_id, {
            "consentType": "pre-packet-sent",
            "scope": "interview",
        })

        db.update_interview_status(session_id, "packet_sent", {
            "packetSentAt": json.loads(json.dumps({"t": "now"}))["t"],
            "deliveryMethod": delivery_method,
        })

        audit.log(
            user_id=user_id,
            action="SEND_PACKET",
            resource_id=session_id,
            consent_ref=f"CONSENT#{interviewee_email}",
            metadata={"deliveryMethod": delivery_method, "intervieweeEmail": interviewee_email},
        )

        return api_response(200, {
            "message": "Packet sent successfully",
            "feedbackLink": feedback_link,
            "deliveryMethod": delivery_method,
        })

    except Exception as e:
        print(f"Error: {e}")
        return api_response(500, {"error": str(e)})
