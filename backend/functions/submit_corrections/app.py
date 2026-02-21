import json
from shared import DynamoDBClient, AuditLogger, api_response

db = DynamoDBClient()
audit = AuditLogger()


def handler(event, context):
    """Public endpoint (no auth) for interviewee to submit corrections and question selections."""
    try:
        session_id = event["pathParameters"]["sessionId"]
        body = json.loads(event.get("body", "{}"))

        interview = db.get_interview(session_id)
        if not interview:
            return api_response(404, {"error": "Session not found"})

        if interview.get("status") not in ("packet_sent", "feedback_received"):
            return api_response(400, {"error": "This session is not accepting feedback"})

        corrections = body.get("corrections", [])
        selected_questions = body.get("selectedQuestions", [])
        opt_out = body.get("optOut", False)

        if opt_out:
            db.update_interview_status(session_id, "opted_out")
            audit.log(
                user_id="interviewee",
                action="OPT_OUT",
                resource_id=session_id,
            )
            return api_response(200, {"message": "You have opted out. Your data will be removed."})

        for idx, correction in enumerate(corrections):
            if not correction.get("originalAssertion") or not correction.get("correction"):
                continue
            db.save_correction(session_id, idx, {
                "originalAssertion": correction["originalAssertion"],
                "correction": correction["correction"],
                "correctionType": correction.get("correctionType", "factual_error"),
                "intervieweeNote": correction.get("note", ""),
            })

        db.update_interview_status(session_id, "feedback_received", {
            "selectedQuestions": selected_questions,
            "correctionCount": len(corrections),
        })

        audit.log(
            user_id="interviewee",
            action="SUBMIT_CORRECTIONS",
            resource_id=session_id,
            metadata={
                "correctionCount": len(corrections),
                "selectedQuestionCount": len(selected_questions),
            },
        )

        return api_response(200, {
            "message": "Thank you! Your feedback has been recorded and will enhance the conversation.",
            "correctionsReceived": len(corrections),
            "questionsSelected": len(selected_questions),
        })

    except Exception as e:
        print(f"Error: {e}")
        return api_response(500, {"error": str(e)})
