import os
import json
import boto3

bedrock = boto3.client("bedrock-runtime")
MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "anthropic.claude-3-sonnet-20240229-v1:0")


class BedrockClient:
    def __init__(self, model_id=None):
        self.model_id = model_id or MODEL_ID

    def invoke(self, system_prompt, user_prompt, max_tokens=4096, temperature=0.3):
        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "temperature": temperature,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_prompt}],
        }
        response = bedrock.invoke_model(
            modelId=self.model_id,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(body),
        )
        result = json.loads(response["body"].read())
        return result["content"][0]["text"]

    def invoke_with_json_output(self, system_prompt, user_prompt, max_tokens=4096):
        raw = self.invoke(system_prompt, user_prompt, max_tokens, temperature=0.2)
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start == -1 or end == 0:
            start = raw.find("[")
            end = raw.rfind("]") + 1
        if start >= 0 and end > start:
            return json.loads(raw[start:end])
        raise ValueError(f"Could not parse JSON from LLM response: {raw[:200]}")

    def generate_company_profile(self, company_name, context_chunks, urls):
        system_prompt = """You are a senior business intelligence analyst at Texas A&M University's Mays Business School. 
You generate structured company profiles for interview preparation. 

GROUNDING RULES:
- Never fabricate specific revenue figures, employee counts, or financial data unless clearly labeled as estimates with confidence ranges.
- Distinguish between "public knowledge," "proprietary TAMU data," and "LLM inference."
- All assertions must be falsifiable — the interviewee can confirm or deny them.
- Tag every assertion with a confidence level: [High], [Medium], or [Low].
- Tag every assertion with a source type: [Public], [Proprietary], or [Inferred].
- Be transparent about uncertainty. It is better to say "we don't know" than to guess."""

        context_text = "\n\n".join(context_chunks) if context_chunks else "No proprietary context available."

        user_prompt = f"""Generate a comprehensive company intelligence profile for: {company_name}

AVAILABLE CONTEXT FROM PROVIDED SOURCES:
{context_text}

URLs PROVIDED: {json.dumps(urls)}

Return a JSON object with this exact structure:
{{
  "companyOverview": "3-4 sentence plain-language summary",
  "marketContext": "4-6 sentence industry dynamics, competitive landscape, macro trends",
  "revenueModelHypothesis": {{
    "description": "How the company likely makes money",
    "confidence": "Low|Medium|High"
  }},
  "whatWeThinkWeKnow": [
    {{
      "assertion": "Specific testable hypothesis",
      "confidence": "Low|Medium|High",
      "sourceType": "Public|Proprietary|Inferred",
      "source": "brief description of source"
    }}
  ],
  "knowledgeGaps": [
    "What we could not determine and should ask about"
  ],
  "industryClassification": {{
    "industry": "",
    "region": "",
    "stage": "startup|growth|mature|enterprise",
    "archetype": "service|saas|hardware_saas|manufacturing|other"
  }}
}}

Generate 5-7 assertions for whatWeThinkWeKnow. Generate 3-5 knowledge gaps.
Be specific and testable. Avoid vague generalizations."""

        return self.invoke_with_json_output(system_prompt, user_prompt, max_tokens=3000)

    def generate_questions(self, company_name, profile, archetype="service"):
        system_prompt = """You are an expert interview coach at Texas A&M University's Mays Business School.
You design strategically sequenced, open-ended, non-leading interview questions.

RULES:
- Never start questions with "Why don't you...", "Isn't it true that...", or "Don't you think..."
- Never embed assumptions (e.g., "How do you handle your high churn?" assumes churn is high)
- Prefer: "How do you think about...", "Walk us through...", "What drives...", "Help us understand..."
- Each question must have a clear discovery objective
- Sequence: Broad Context → Business Model → Specific Insight → Strategic Tension → Future Direction
- Include follow-up stems and coaching cues for each question"""

        user_prompt = f"""Generate interview questions for: {company_name}
Company archetype: {archetype}

COMPANY PROFILE:
{json.dumps(profile, indent=2)}

Return a JSON object:
{{
  "intervieweeQuestions": [
    {{
      "id": "q1",
      "question": "The question text",
      "followUpStem": "Pre-written follow-up probe",
      "objective": "What this question aims to discover",
      "coachingCue": "Right-side bracketed coaching note (max 15 words)",
      "phase": "opening|deep_dive|strategic|closing"
    }}
  ]
}}

Generate exactly 8 questions. The first 5-6 should be included in the interviewee packet for selection.
Make questions specific to the company profile, not generic."""

        return self.invoke_with_json_output(system_prompt, user_prompt, max_tokens=3000)

    def generate_interviewer_brief(self, company_name, profile, questions, corrections=None, selected_questions=None):
        system_prompt = """You are a senior analyst generating an Interviewer Brief document for Texas A&M's business intelligence interview program.
The brief should be comprehensive (2-3 pages worth of content), with right-side coaching cues in [BRACKETS].
Format as structured HTML for easy rendering.
Question split: The first 5-6 questions in the list are the packet menu (interviewee saw these and selects 2-3). The rest are interviewer-only. In page2_questionSequence: put interviewee-selected questions (when provided) in selectedQuestions; put all remaining questions in additionalQuestions (unselected menu questions first, then interviewer-only). Each question object must include id, question, followUpStem, objective, coachingCue, phase."""

        corrections_text = ""
        if corrections:
            corrections_text = f"""
INTERVIEWEE CORRECTIONS (highlight these prominently):
{json.dumps(corrections, indent=2)}
Open the interview with: "Thanks for reviewing the packet. What did we get wrong?"
"""

        selected_text = ""
        if selected_questions:
            selected_text = f"\nINTERVIEWEE-SELECTED QUESTIONS (prioritize these): {json.dumps(selected_questions)}"

        user_prompt = f"""Generate a complete Interviewer Brief for: {company_name}

COMPANY PROFILE:
{json.dumps(profile, indent=2)}

ALL QUESTIONS (full set for interviewer): The first 5-6 are the packet menu (interviewee sees these and selects 2-3). The rest are interviewer-only backup/deeper questions.
{json.dumps(questions, indent=2)}
{corrections_text}
{selected_text}

Return a JSON object:
{{
  "title": "Interviewer Brief: {{company_name}}",
  "generatedAt": "timestamp",
  "page1_companyContext": {{
    "companyHeader": {{
      "name": "",
      "industry": "",
      "region": "",
      "stage": ""
    }},
    "companyOverview": "3-4 sentences with [COACHING CUES]",
    "marketContext": "4-6 sentences with [COACHING CUES]",
    "revenueModelHypothesis": {{
      "text": "",
      "confidence": ""
    }},
    "whatWeThinkWeKnow": [
      {{
        "assertion": "",
        "confidence": "",
        "sourceType": "",
        "wasCorrection": false,
        "correctionNote": ""
      }}
    ],
    "openingCoachingCue": "[RIGHT-SIDE NOTE: Start by asking what we got wrong. Let them talk.]"
  }},
  "page2_questionSequence": {{
    "selectedQuestions": [],
    "additionalQuestions": [],
    "knowledgeGaps": []
  }},
  "page3_insightCapture": {{
    "liveNotesTemplate": {{
      "corrections": [],
      "keyInsights": [],
      "surprises": [],
      "followUpActions": []
    }},
    "closingProtocol": "Thank interviewee, confirm follow-up, ask permission to share summary",
    "closingCoachingCue": "[Before hanging up, confirm top 3 constraints]"
  }}
}}"""

        return self.invoke_with_json_output(system_prompt, user_prompt, max_tokens=4096)

    def generate_interviewee_packet(self, company_name, profile, questions):
        system_prompt = """You are generating a professional 1-page Interviewee Pre-Packet for Texas A&M University's Mays Business School.
This packet is sent to a business leader before an interview. It must be:
- Respectful and professional
- Transparent about sources
- Inviting corrections and engagement
- Skimmable in 3 minutes
The QUESTIONS provided are exactly the question menu (5-6 items). Use every one in questionMenu; the interviewee will select 2-3 that interest them."""

        user_prompt = f"""Generate an Interviewee Pre-Packet for: {company_name}

COMPANY PROFILE:
{json.dumps(profile, indent=2)}

QUESTION MENU (use all of these in questionMenu; interviewee selects 2-3):
{json.dumps(questions, indent=2)}

Return a JSON object:
{{
  "header": {{
    "institution": "Texas A&M University — Mays Business School",
    "program": "Texas Insights Engine",
    "companyName": "{company_name}",
    "preparedFor": "Business Leader"
  }},
  "whatWeLearned": "3-5 paragraph summary of AI-gathered intelligence with [Source: type] tags",
  "accuracyRequest": "Please let us know what we got right, what we got wrong, and what we missed. Your corrections make this conversation far more valuable.",
  "questionMenu": [
    {{
      "id": "q1",
      "question": "Open-ended, non-leading question",
      "context": "Brief context for why this question matters"
    }}
  ],
  "transparencyFooter": {{
    "sourcesUsed": ["List of source types used"],
    "statement": "No data was collected without your knowledge; all sources are public or provided by TAMU staff.",
    "optOutNote": "You may opt out of this process at any time."
  }}
}}

Include every question from the list above in questionMenu (same id and question text; add a short context for each). Make the whatWeLearned section engaging but humble."""

        return self.invoke_with_json_output(system_prompt, user_prompt, max_tokens=3000)

    def generate_post_call_synthesis(self, company_name, interview_notes, profile):
        system_prompt = """You are mapping interview insights to the Texas Insights Engine knowledge graph schema.
RULES:
- Do not hallucinate beyond the provided notes
- Flag unconfirmed assertions
- Tag knowledge graph nodes appropriately
- Distinguish between confirmed facts and inferences"""

        user_prompt = f"""Synthesize interview notes for: {company_name}

INTERVIEW NOTES:
{json.dumps(interview_notes, indent=2)}

ORIGINAL PROFILE:
{json.dumps(profile, indent=2)}

Return a JSON object matching the Texas Insights Engine schema:
{{
  "companyProfile": {{
    "name": "{company_name}",
    "industry": "",
    "region": "",
    "stage": "",
    "employeeRange": "",
    "revenueRange": "",
    "ownershipType": ""
  }},
  "constraintMap": {{
    "top3Constraints": [
      {{
        "constraint": "",
        "type": "demand|fulfillment|capital|regulation|talent|execution",
        "confirmed": true
      }}
    ]
  }},
  "marketStructure": {{
    "regulatoryStructure": "",
    "competitiveFragmentation": "",
    "barriersToEntry": "",
    "disintermediationRisk": ""
  }},
  "strategicTensions": [
    {{
      "tension": "",
      "riskLevel": "low|medium|high",
      "description": ""
    }}
  ],
  "aiOpportunities": [
    {{
      "area": "",
      "description": "",
      "estimatedImpact": "low|medium|high"
    }}
  ],
  "knowledgeGraphTags": {{
    "industryCluster": "",
    "riskFlags": [],
    "growthSignals": [],
    "relatedCompanies": []
  }},
  "unresolvedQuestions": [
    "Questions for follow-up"
  ],
  "keyDeltasFromProfile": [
    "What changed from the original AI profile based on the interview"
  ]
}}"""

        return self.invoke_with_json_output(system_prompt, user_prompt, max_tokens=3000)
