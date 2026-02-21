import json
from shared import DynamoDBClient, S3Client, BedrockClient, AuditLogger, api_response

db = DynamoDBClient()
s3 = S3Client()
bedrock = BedrockClient()
audit = AuditLogger()


def handler(event, context):
    try:
        session_id = event["pathParameters"]["sessionId"]
        body = json.loads(event.get("body", "{}"))
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

        interview = db.get_interview(session_id)
        if not interview:
            return api_response(404, {"error": "Session not found"})

        if interview.get("interviewerId") != user_id:
            return api_response(403, {"error": "Access denied"})

        interview_notes = {
            "corrections": body.get("corrections", []),
            "keyInsights": body.get("keyInsights", []),
            "surprises": body.get("surprises", []),
            "constraints": body.get("constraints", []),
            "followUpActions": body.get("followUpActions", []),
            "mergedSuggestions": body.get("mergedSuggestions", []),
            "skippedSuggestions": body.get("skippedSuggestions", []),
            "rawNotes": body.get("rawNotes", ""),
        }

        notes_key = f"notes/{session_id}/interview_notes.json"
        s3.upload_json(notes_key, interview_notes)

        profile_key = interview.get("profileKey")
        profile = s3.get_json(profile_key) if profile_key else {}

        synthesis = bedrock.generate_post_call_synthesis(
            interview["companyName"],
            interview_notes,
            profile,
        )

        current_brief = db.get_latest_brief(session_id)
        current_version = current_brief.get("version", "v1") if current_brief else "v1"
        version_num = int(current_version.replace("v", ""))

        synthesis_key = f"synthesis/{session_id}/v{version_num}/synthesis.json"
        s3.upload_json(synthesis_key, synthesis)

        db.save_synthesis(session_id, f"v{version_num}", {
            "synthesisS3Key": synthesis_key,
            "insightTags": synthesis.get("knowledgeGraphTags", {}).get("growthSignals", []),
            "constraintMap": synthesis.get("constraintMap", {}),
        })

        db.update_insights_engine(interview["companyName"], synthesis)

        db.update_interview_status(session_id, "completed", {
            "stage": "post-interview",
            "synthesisVersion": f"v{version_num}",
            "notesKey": notes_key,
        })

        audit.log(
            user_id=user_id,
            action="POST_CALL_SYNTHESIS",
            resource_id=session_id,
            sources=["interview_notes", "bedrock_claude"],
            metadata={
                "insightCount": len(interview_notes.get("keyInsights", [])),
                "constraintCount": len(synthesis.get("constraintMap", {}).get("top3Constraints", [])),
            },
        )

        return api_response(200, {
            "message": "Post-call synthesis complete",
            "synthesis": synthesis,
            "insightsUpdated": True,
        })

    except Exception as e:
        print(f"Error: {e}")
        return api_response(500, {"error": str(e)})
