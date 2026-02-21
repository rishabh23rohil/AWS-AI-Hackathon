import json
from shared import DynamoDBClient, api_response

db = DynamoDBClient()


def handler(event, context):
    try:
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        interviews = db.list_user_interviews(user_id)

        sessions = []
        for item in interviews:
            sessions.append({
                "sessionId": item.get("sessionId"),
                "companyName": item.get("companyName"),
                "leaderName": item.get("leaderName"),
                "status": item.get("status"),
                "stage": item.get("stage"),
                "createdAt": item.get("GSI1SK", "").replace("INTERVIEW#", ""),
                "qualityScore": item.get("qualityScore"),
            })

        return api_response(200, {"sessions": sessions})

    except Exception as e:
        print(f"Error: {e}")
        return api_response(500, {"error": str(e)})
