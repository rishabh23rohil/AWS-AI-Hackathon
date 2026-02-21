import json
import re
from shared import DynamoDBClient, AuditLogger, step_function_response, BedrockClient

db = DynamoDBClient()
audit = AuditLogger()
bedrock = BedrockClient()

LEADING_PATTERNS = [
    r"^why don'?t you",
    r"^isn'?t it true",
    r"^don'?t you think",
    r"^wouldn'?t you agree",
    r"^surely you",
    r"^obviously",
    r"your high \w+",
    r"your low \w+",
    r"your poor \w+",
    r"your declining",
    r"your struggling",
]

PREFERRED_STARTS = [
    "how do you think about",
    "walk us through",
    "what drives",
    "help us understand",
    "tell us about",
    "how would you describe",
    "what role does",
    "at a high level",
]


def check_non_leading(question_text):
    lower = question_text.lower().strip()
    issues = []

    for pattern in LEADING_PATTERNS:
        if re.search(pattern, lower):
            issues.append(f"Leading pattern detected: '{pattern}' in question: '{question_text[:60]}...'")

    if "?" not in question_text:
        issues.append(f"Not a question (missing '?'): '{question_text[:60]}...'")

    return issues


def check_question_quality(questions):
    all_issues = []
    score = 100

    if len(questions) < 5:
        all_issues.append(f"Too few questions: {len(questions)} (minimum 5)")
        score -= 20

    phases_seen = set()
    for q in questions:
        q_text = q.get("question", "")
        issues = check_non_leading(q_text)
        all_issues.extend(issues)
        score -= len(issues) * 10

        if not q.get("followUpStem"):
            all_issues.append(f"Missing follow-up stem for: '{q_text[:40]}...'")
            score -= 5

        if not q.get("objective"):
            all_issues.append(f"Missing objective for: '{q_text[:40]}...'")
            score -= 5

        if not q.get("coachingCue"):
            all_issues.append(f"Missing coaching cue for: '{q_text[:40]}...'")
            score -= 5

        phase = q.get("phase", "")
        if phase:
            phases_seen.add(phase)

    expected_phases = {"opening", "deep_dive", "strategic", "closing"}
    missing_phases = expected_phases - phases_seen
    if missing_phases:
        all_issues.append(f"Missing question phases: {missing_phases}")
        score -= len(missing_phases) * 5

    return max(0, score), all_issues


def handler(event, context):
    try:
        session_id = event["sessionId"]
        user_id = event.get("userId", "system")

        generation = event.get("generationResult", {})
        questions = generation.get("questions", [])

        score, issues = check_question_quality(questions)
        passed = score >= 60

        audit.log(
            user_id=user_id,
            action="QUALITY_CHECK",
            resource_id=session_id,
            metadata={
                "score": score,
                "passed": passed,
                "issueCount": len(issues),
            },
        )

        final_status = "ready" if passed else "quality_failed"
        db.update_interview_status(session_id, final_status, {
            "qualityScore": score,
            "qualityIssueCount": len(issues),
        })

        return step_function_response(200, {
            "passed": passed,
            "score": score,
            "issues": issues[:10],
        })

    except Exception as e:
        print(f"Quality check error: {e}")
        raise
