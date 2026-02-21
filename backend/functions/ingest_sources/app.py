import json
import os
import boto3
import urllib.request
import re
from html.parser import HTMLParser
from shared import DynamoDBClient, S3Client, AuditLogger, step_function_response

comprehend = boto3.client("comprehend")
textract = boto3.client("textract")
db = DynamoDBClient()
s3_client = S3Client()
audit = AuditLogger()
BUCKET = os.environ.get("S3_BUCKET", "")


class HTMLTextExtractor(HTMLParser):
    """Strips HTML tags and extracts clean text."""

    def __init__(self):
        super().__init__()
        self.result = []
        self._skip = False
        self._skip_tags = {"script", "style", "nav", "footer", "header"}

    def handle_starttag(self, tag, attrs):
        if tag in self._skip_tags:
            self._skip = True

    def handle_endtag(self, tag):
        if tag in self._skip_tags:
            self._skip = False

    def handle_data(self, data):
        if not self._skip:
            text = data.strip()
            if text:
                self.result.append(text)

    def get_text(self):
        return " ".join(self.result)


def fetch_url_content(url):
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "TexasInsightsEngine/1.0 (Academic Research; Texas A&M University)"},
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
        extractor = HTMLTextExtractor()
        extractor.feed(html)
        text = extractor.get_text()
        return text[:10000]  # Cap at 10k chars per URL
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
        return ""


def chunk_text(text, chunk_size=1500, overlap=200):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i : i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
    return chunks


def extract_entities(text):
    if not text or len(text) < 10:
        return []
    truncated = text[:4500]  # Comprehend limit
    try:
        resp = comprehend.detect_entities(Text=truncated, LanguageCode="en")
        entities = []
        seen = set()
        for entity in resp["Entities"]:
            key = (entity["Text"].lower(), entity["Type"])
            if key not in seen and entity["Score"] > 0.8:
                seen.add(key)
                entities.append({
                    "text": entity["Text"],
                    "type": entity["Type"],
                    "score": round(entity["Score"], 3),
                })
        return entities
    except Exception as e:
        print(f"Entity extraction failed: {e}")
        return []


def extract_key_phrases(text):
    if not text or len(text) < 10:
        return []
    truncated = text[:4500]
    try:
        resp = comprehend.detect_key_phrases(Text=truncated, LanguageCode="en")
        return [
            kp["Text"]
            for kp in resp["KeyPhrases"]
            if kp["Score"] > 0.8
        ][:20]
    except Exception as e:
        print(f"Key phrase extraction failed: {e}")
        return []


def process_pdf(session_id, user_id):
    pdf_key = f"uploads/{user_id}/{session_id}/document.pdf"
    try:
        s3_resource = boto3.client("s3")
        s3_resource.head_object(Bucket=BUCKET, Key=pdf_key)
    except Exception:
        return "", []

    try:
        resp = textract.detect_document_text(
            Document={"S3Object": {"Bucket": BUCKET, "Name": pdf_key}}
        )
        lines = [
            block["Text"]
            for block in resp["Blocks"]
            if block["BlockType"] == "LINE"
        ]
        text = " ".join(lines)

        extracted_key = f"extracted/{session_id}/textract_output.txt"
        s3_client.upload_text(extracted_key, text)

        entities = extract_entities(text)
        return text, entities
    except Exception as e:
        print(f"Textract processing failed: {e}")
        return "", []


def handler(event, context):
    try:
        session_id = event["sessionId"]
        company_name = event["companyName"]
        urls = event.get("urls", [])
        user_id = event.get("userId", "system")
        has_pdf = event.get("hasPdf", False)

        all_text = []
        all_entities = []
        sources = []

        for url in urls:
            content = fetch_url_content(url)
            if content:
                all_text.append(content)
                entities = extract_entities(content)
                all_entities.extend(entities)
                sources.append({"type": "url", "url": url, "charCount": len(content)})

        if has_pdf:
            pdf_text, pdf_entities = process_pdf(session_id, user_id)
            if pdf_text:
                all_text.append(pdf_text)
                all_entities.extend(pdf_entities)
                sources.append({"type": "pdf", "charCount": len(pdf_text)})

        combined = " ".join(all_text)
        chunks = chunk_text(combined) if combined else []
        key_phrases = extract_key_phrases(combined) if combined else []

        if chunks:
            chunks_key = f"extracted/{session_id}/chunks.json"
            s3_client.upload_json(chunks_key, {"chunks": chunks, "entities": all_entities, "keyPhrases": key_phrases})

        unique_entities = []
        seen = set()
        for e in all_entities:
            key = e["text"].lower()
            if key not in seen:
                seen.add(key)
                unique_entities.append(e)

        db.update_interview_status(session_id, "ingested", {
            "sourceCount": len(sources),
            "chunkCount": len(chunks),
            "entityCount": len(unique_entities),
        })

        audit.log(
            user_id=user_id,
            action="INGEST_SOURCES",
            resource_id=session_id,
            sources=[s.get("url", s.get("type")) for s in sources],
        )

        return step_function_response(200, {
            "chunks": chunks[:15],  # Top 15 chunks for LLM context
            "entities": unique_entities[:30],
            "sources": sources,
            "keyPhrases": key_phrases,
        })

    except Exception as e:
        print(f"Ingestion error: {e}")
        raise
