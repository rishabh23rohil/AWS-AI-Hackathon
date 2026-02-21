import os
import boto3
from datetime import datetime, timezone
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")


class DynamoDBClient:
    def __init__(self):
        self.interviews = dynamodb.Table(os.environ["INTERVIEWS_TABLE"])
        self.users = dynamodb.Table(os.environ["USERS_TABLE"])
        self.audit = dynamodb.Table(os.environ["AUDIT_TABLE"])
        self.insights = dynamodb.Table(os.environ["INSIGHTS_TABLE"])
        self.consent = dynamodb.Table(os.environ["CONSENT_TABLE"])

    def create_interview(self, session_id, data):
        now = datetime.now(timezone.utc).isoformat()
        item = {
            "PK": f"INTERVIEW#{session_id}",
            "SK": "META",
            "GSI1PK": f"USER#{data['interviewerId']}",
            "GSI1SK": f"INTERVIEW#{now}",
            "sessionId": session_id,
            "companyName": data["companyName"],
            "leaderName": data.get("leaderName", ""),
            "interviewerId": data["interviewerId"],
            "intervieweeEmail": data.get("intervieweeEmail", ""),
            "urls": data.get("urls", []),
            "status": "created",
            "stage": "pre-interview",
            "createdAt": now,
            "updatedAt": now,
        }
        self.interviews.put_item(Item=item)
        return item

    def get_interview(self, session_id):
        resp = self.interviews.get_item(
            Key={"PK": f"INTERVIEW#{session_id}", "SK": "META"}
        )
        return resp.get("Item")

    def update_interview_status(self, session_id, status, extra_fields=None):
        update_expr = "SET #status = :status, updatedAt = :now"
        expr_values = {
            ":status": status,
            ":now": datetime.now(timezone.utc).isoformat(),
        }
        expr_names = {"#status": "status"}

        if extra_fields:
            for key, value in extra_fields.items():
                update_expr += f", #{key} = :{key}"
                expr_values[f":{key}"] = value
                expr_names[f"#{key}"] = key

        self.interviews.update_item(
            Key={"PK": f"INTERVIEW#{session_id}", "SK": "META"},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_values,
            ExpressionAttributeNames=expr_names,
        )

    def save_brief(self, session_id, version, brief_data):
        now = datetime.now(timezone.utc).isoformat()
        self.interviews.put_item(
            Item={
                "PK": f"INTERVIEW#{session_id}",
                "SK": f"BRIEF#{version}",
                "briefS3Key": brief_data["briefS3Key"],
                "packetS3Key": brief_data["packetS3Key"],
                "generatedAt": now,
                "sources": brief_data.get("sources", []),
                "correctionCount": 0,
                "version": version,
            }
        )

    def get_latest_brief(self, session_id):
        resp = self.interviews.query(
            KeyConditionExpression=Key("PK").eq(f"INTERVIEW#{session_id}")
            & Key("SK").begins_with("BRIEF#"),
            ScanIndexForward=False,
            Limit=1,
        )
        items = resp.get("Items", [])
        return items[0] if items else None

    def save_correction(self, session_id, idx, correction_data):
        now = datetime.now(timezone.utc).isoformat()
        self.interviews.put_item(
            Item={
                "PK": f"INTERVIEW#{session_id}",
                "SK": f"CORRECTION#{idx:04d}",
                "originalAssertion": correction_data["originalAssertion"],
                "correction": correction_data["correction"],
                "correctionType": correction_data.get("correctionType", "factual_error"),
                "intervieweeNote": correction_data.get("intervieweeNote", ""),
                "timestamp": now,
            }
        )

    def get_corrections(self, session_id):
        resp = self.interviews.query(
            KeyConditionExpression=Key("PK").eq(f"INTERVIEW#{session_id}")
            & Key("SK").begins_with("CORRECTION#")
        )
        return resp.get("Items", [])

    def save_synthesis(self, session_id, version, synthesis_data):
        now = datetime.now(timezone.utc).isoformat()
        self.interviews.put_item(
            Item={
                "PK": f"INTERVIEW#{session_id}",
                "SK": f"SYNTHESIS#{version}",
                "synthesisS3Key": synthesis_data["synthesisS3Key"],
                "insightTags": synthesis_data.get("insightTags", []),
                "constraintMap": synthesis_data.get("constraintMap", {}),
                "createdAt": now,
                "version": version,
            }
        )

    def list_user_interviews(self, user_id):
        resp = self.interviews.query(
            IndexName="GSI1",
            KeyConditionExpression=Key("GSI1PK").eq(f"USER#{user_id}"),
            ScanIndexForward=False,
        )
        return resp.get("Items", [])

    def update_insights_engine(self, company_name, profile_data):
        now = datetime.now(timezone.utc).isoformat()
        self.insights.put_item(
            Item={
                "PK": f"COMPANY#{company_name}",
                "SK": "PROFILE",
                "companyProfile": profile_data.get("companyProfile", {}),
                "constraintMap": profile_data.get("constraintMap", {}),
                "marketStructure": profile_data.get("marketStructure", {}),
                "strategicTensions": profile_data.get("strategicTensions", []),
                "aiOpportunities": profile_data.get("aiOpportunities", []),
                "knowledgeGraphTags": profile_data.get("knowledgeGraphTags", []),
                "updatedAt": now,
            }
        )

    def save_consent(self, email, session_id, consent_data):
        now = datetime.now(timezone.utc).isoformat()
        self.consent.put_item(
            Item={
                "PK": f"CONSENT#{email}",
                "SK": f"INTERVIEW#{session_id}",
                "consentType": consent_data.get("consentType", "pre-packet"),
                "grantedAt": now,
                "scope": consent_data.get("scope", "interview"),
                "expiresAt": consent_data.get("expiresAt", ""),
            }
        )
