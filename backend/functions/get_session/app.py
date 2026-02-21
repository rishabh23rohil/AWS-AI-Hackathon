import json
from shared import DynamoDBClient, S3Client, api_response

db = DynamoDBClient()
s3 = S3Client()


def handler(event, context):
    try:
        session_id = event["pathParameters"]["sessionId"]
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

        interview = db.get_interview(session_id)
        if not interview:
            return api_response(404, {"error": "Session not found"})

        if interview.get("interviewerId") != user_id:
            return api_response(403, {"error": "Access denied"})

        brief_meta = db.get_latest_brief(session_id)
        corrections = db.get_corrections(session_id)

        brief_data = None
        packet_data = None
        profile_data = None
        questions_data = None

        if brief_meta:
            try:
                brief_data = s3.get_json(brief_meta["briefS3Key"])
            except Exception:
                pass
            try:
                packet_data = s3.get_json(brief_meta["packetS3Key"])
            except Exception:
                pass

        profile_key = interview.get("profileKey")
        if profile_key:
            try:
                profile_data = s3.get_json(profile_key)
            except Exception:
                pass

        questions_key = interview.get("questionsKey")
        if questions_key:
            try:
                questions_data = s3.get_json(questions_key)
            except Exception:
                pass

        return api_response(200, {
            "session": interview,
            "brief": brief_data,
            "packet": packet_data,
            "profile": profile_data,
            "questions": questions_data,
            "corrections": corrections,
            "briefMeta": brief_meta,
        })

    except Exception as e:
        print(f"Error: {e}")
        return api_response(500, {"error": str(e)})
