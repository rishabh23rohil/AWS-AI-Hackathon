import os
import uuid
import boto3
from datetime import datetime, timezone

dynamodb = boto3.resource("dynamodb")


class AuditLogger:
    def __init__(self):
        self.table = dynamodb.Table(os.environ["AUDIT_TABLE"])

    def log(self, user_id, action, resource_id, sources=None, consent_ref=None, metadata=None):
        now = datetime.now(timezone.utc)
        date_str = now.strftime("%Y-%m-%d")
        event_id = f"EVENT#{now.isoformat()}#{uuid.uuid4().hex[:8]}"

        item = {
            "PK": f"AUDIT#{date_str}",
            "SK": event_id,
            "userId": user_id,
            "action": action,
            "resourceId": resource_id,
            "sources": sources or [],
            "consentRef": consent_ref or "",
            "timestamp": now.isoformat(),
            "ttl": int((now.timestamp()) + (730 * 86400)),  # 2 year retention
        }
        if metadata:
            item["metadata"] = metadata

        self.table.put_item(Item=item)
        return event_id
