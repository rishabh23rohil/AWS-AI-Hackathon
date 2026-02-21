import os
import json
import boto3

s3 = boto3.client("s3")
BUCKET = os.environ.get("S3_BUCKET", "")


class S3Client:
    def __init__(self, bucket=None):
        self.bucket = bucket or BUCKET

    def upload_json(self, key, data):
        s3.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=json.dumps(data, default=str),
            ContentType="application/json",
        )
        return key

    def get_json(self, key):
        resp = s3.get_object(Bucket=self.bucket, Key=key)
        return json.loads(resp["Body"].read().decode("utf-8"))

    def upload_text(self, key, text, content_type="text/plain"):
        s3.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=text.encode("utf-8"),
            ContentType=content_type,
        )
        return key

    def get_text(self, key):
        resp = s3.get_object(Bucket=self.bucket, Key=key)
        return resp["Body"].read().decode("utf-8")

    def generate_presigned_url(self, key, expiration=3600):
        return s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": key},
            ExpiresIn=expiration,
        )

    def generate_upload_url(self, key, content_type="application/pdf", expiration=3600):
        return s3.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": self.bucket,
                "Key": key,
                "ContentType": content_type,
            },
            ExpiresIn=expiration,
        )

    def list_objects(self, prefix):
        resp = s3.list_objects_v2(Bucket=self.bucket, Prefix=prefix)
        return resp.get("Contents", [])
