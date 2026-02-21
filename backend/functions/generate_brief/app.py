import json
from shared import DynamoDBClient, S3Client, BedrockClient, AuditLogger, step_function_response

db = DynamoDBClient()
s3 = S3Client()
bedrock = BedrockClient()
audit = AuditLogger()


def handler(event, context):
    try:
        session_id = event["sessionId"]
        company_name = event["companyName"]
        user_id = event.get("userId", "system")
        is_regen = event.get("isRegeneration", False)
        quality_feedback = event.get("qualityFeedback", [])

        ingestion = event.get("ingestionResult", {})
        chunks = ingestion.get("chunks", [])
        entities = ingestion.get("entities", [])
        sources = ingestion.get("sources", [])
        urls = event.get("urls", [])

        context_chunks = chunks.copy()
        if entities:
            entity_text = "Key entities identified: " + ", ".join(
                [f"{e['text']} ({e['type']})" for e in entities[:15]]
            )
            context_chunks.insert(0, entity_text)

        if quality_feedback:
            feedback_text = "QUALITY FEEDBACK FROM PRIOR GENERATION (fix these issues): " + "; ".join(quality_feedback)
            context_chunks.insert(0, feedback_text)

        profile = bedrock.generate_company_profile(company_name, context_chunks, urls)
        archetype = profile.get("industryClassification", {}).get("archetype", "service")
        questions_data = bedrock.generate_questions(company_name, profile, archetype)
        questions = questions_data.get("intervieweeQuestions", [])
        # Plan: packet shows only 5-6 (menu for interviewee to select 2-3); brief shows all 8 with selected first, then additional (incl. interviewer-only).
        packet_questions = questions[:6]  # first 5-6 are the interviewee question menu

        brief = bedrock.generate_interviewer_brief(company_name, profile, questions)
        packet = bedrock.generate_interviewee_packet(company_name, profile, packet_questions)

        brief_key = f"briefs/{session_id}/v1/interviewer_brief.json"
        packet_key = f"packets/{session_id}/interviewee_packet.json"
        profile_key = f"briefs/{session_id}/v1/company_profile.json"
        questions_key = f"briefs/{session_id}/v1/questions.json"

        s3.upload_json(brief_key, brief)
        s3.upload_json(packet_key, packet)
        s3.upload_json(profile_key, profile)
        s3.upload_json(questions_key, {"questions": questions})

        source_types = list({s.get("type", "unknown") for s in sources})
        source_types.append("bedrock_claude")

        db.save_brief(session_id, "v1", {
            "briefS3Key": brief_key,
            "packetS3Key": packet_key,
            "sources": source_types,
        })

        db.update_interview_status(session_id, "generated", {
            "briefVersion": "v1",
            "questionCount": len(questions),
            "profileKey": profile_key,
            "questionsKey": questions_key,
        })

        audit.log(
            user_id=user_id,
            action="GENERATE_BRIEF",
            resource_id=session_id,
            sources=source_types,
            metadata={
                "questionCount": len(questions),
                "isRegeneration": is_regen,
                "archetype": archetype,
            },
        )

        return step_function_response(200, {
            "briefS3Key": brief_key,
            "packetS3Key": packet_key,
            "questions": questions,
            "profileArchetype": archetype,
        })

    except Exception as e:
        print(f"Generation error: {e}")
        raise
