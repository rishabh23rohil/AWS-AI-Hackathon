import json
from shared import DynamoDBClient, S3Client, BedrockClient, AuditLogger, api_response

db = DynamoDBClient()
s3 = S3Client()
bedrock = BedrockClient()
audit = AuditLogger()


def handler(event, context):
    try:
        session_id = event["pathParameters"]["sessionId"]
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

        interview = db.get_interview(session_id)
        if not interview:
            return api_response(404, {"error": "Session not found"})

        if interview.get("interviewerId") != user_id:
            return api_response(403, {"error": "Access denied"})

        corrections = db.get_corrections(session_id)
        selected_questions = interview.get("selectedQuestions", [])

        profile_key = interview.get("profileKey")
        questions_key = interview.get("questionsKey")

        if not profile_key or not questions_key:
            return api_response(400, {"error": "No original brief found to update"})

        profile = s3.get_json(profile_key)
        questions_data = s3.get_json(questions_key)
        questions = questions_data.get("questions", [])

        correction_list = [
            {
                "originalAssertion": c.get("originalAssertion"),
                "correction": c.get("correction"),
                "correctionType": c.get("correctionType"),
            }
            for c in corrections
        ]

        updated_brief = bedrock.generate_interviewer_brief(
            interview["companyName"],
            profile,
            questions,
            corrections=correction_list if correction_list else None,
            selected_questions=selected_questions if selected_questions else None,
        )

        current_brief = db.get_latest_brief(session_id)
        current_version = current_brief.get("version", "v1") if current_brief else "v1"
        version_num = int(current_version.replace("v", "")) + 1
        new_version = f"v{version_num}"

        brief_key = f"briefs/{session_id}/{new_version}/interviewer_brief.json"
        s3.upload_json(brief_key, updated_brief)

        packet_key = current_brief.get("packetS3Key", "") if current_brief else ""

        db.save_brief(session_id, new_version, {
            "briefS3Key": brief_key,
            "packetS3Key": packet_key,
            "sources": ["bedrock_claude", "interviewee_corrections"],
        })

        db.update_interview_status(session_id, "updated", {
            "briefVersion": new_version,
            "correctionIntegrated": True,
        })

        audit.log(
            user_id=user_id,
            action="UPDATE_BRIEF",
            resource_id=session_id,
            sources=["interviewee_corrections", "bedrock_claude"],
            metadata={
                "correctionCount": len(correction_list),
                "selectedQuestionCount": len(selected_questions),
                "newVersion": new_version,
            },
        )

        return api_response(200, {
            "message": "Brief updated with corrections",
            "version": new_version,
            "brief": updated_brief,
            "correctionsIntegrated": len(correction_list),
            "selectedQuestions": selected_questions,
        })

    except Exception as e:
        print(f"Error: {e}")
        return api_response(500, {"error": str(e)})
