import json

from app.core.sanitize import sanitize_for_prompt


def build_cv_revamp_prompt(
    cv_text: str,
    analysis: dict,
    target_role: str,
    industry: str
) -> str:

    cv_text = sanitize_for_prompt(cv_text or "", max_chars=12000)

    missing_keywords = analysis.get("missing_keywords", {})
    critical_keywords = missing_keywords.get("critical", [])
    recommended_keywords = missing_keywords.get("recommended", [])
    industry_keywords = missing_keywords.get("industry_specific", [])

    # Weak spots to specifically address while rewriting (context, not a checklist)
    skill_gaps = analysis.get("skills_analysis", {}).get("skill_gaps", [])
    grammar_issues = analysis.get("grammar_feedback", {}).get("issues", [])
    ats_issues = (
        analysis.get("ats_compatibility", {}).get("parsing_issues", [])
        + analysis.get("ats_compatibility", {}).get("formatting_problems", [])
    )
    recruiter_concerns = analysis.get("recruiter_feedback", {}).get("concerns", [])

    return f"""You are an elite CV writer and career coach specializing in the {industry} industry.

TASK
Produce a COMPLETE, polished, ATS-optimized CV — a full document with every
section written out in full, NOT a list of corrections and NOT only the parts
that were flagged. Rewrite the entire CV from the candidate's real content.

TARGET ROLE: {target_role}
INDUSTRY: {industry}

ORIGINAL CV:
\"\"\"
{cv_text}
\"\"\"

CONTEXT — weaknesses to fix while you rewrite (use as guidance, not output):
Skill gaps: {json.dumps(skill_gaps)}
Grammar issues: {json.dumps(grammar_issues)}
ATS issues: {json.dumps(ats_issues)}
Recruiter concerns: {json.dumps(recruiter_concerns)}
Keywords to weave in naturally (only where truthful):
  critical: {json.dumps(critical_keywords)}
  recommended: {json.dumps(recommended_keywords)}
  industry: {json.dumps(industry_keywords)}

HOW TO WRITE IT
- Write EVERY section in full. Include all standard sections that apply:
  professional summary, technical skills (grouped by category), professional
  experience, projects, education, languages. If the original is missing an
  expected section (e.g. no summary), create it from the candidate's real
  content.
- Rewrite EVERY experience and project as 3-6 strong, achievement-oriented
  bullets: action verb + what you did + tools/tech + measurable impact. Expand
  terse or one-line entries into full professional bullets. Never leave a role
  with an empty bullet list.
- Integrate the missing keywords naturally where they are genuinely true.
- Fix all grammar, formatting, and ATS issues in the rewrite.

STRICT RULES
- Do NOT invent employers, job titles, dates, degrees, or certifications.
- Do NOT fabricate metrics — only quantify where the original supports it.
- Keep it truthful to the candidate's real background; improve wording, do not
  invent history.

OUTPUT — return ONLY valid JSON in EXACTLY this shape (camelCase keys, no
markdown, no commentary). Every `bullets` field MUST be a non-empty array of
strings:
{{
  "revamped_cv": {{
    "name": "Full Name",
    "contactInfo": "email · phone · city, country",
    "links": "LinkedIn URL · GitHub URL · Portfolio URL",
    "credentials": "short credential line or empty string",
    "professionalSummary": "3-5 sentence summary tailored to the target role",
    "technicalSkills": {{
      "Category name": "comma, separated, skills",
      "Another category": "comma, separated, skills"
    }},
    "experience": [
      {{
        "title": "Job Title",
        "company": "Company",
        "dates": "Mon YYYY – Mon YYYY",
        "bullets": ["achievement bullet", "achievement bullet", "achievement bullet"]
      }}
    ],
    "projects": [
      {{
        "name": "Project Name",
        "technologies": "Tech, stack, used",
        "bullets": ["what it does / your role / impact", "bullet"]
      }}
    ],
    "education": [
      {{
        "degree": "Qualification",
        "institution": "Institution",
        "dates": "YYYY – YYYY",
        "details": "optional detail or empty string"
      }}
    ],
    "languages": ["Language (proficiency)"]
  }},
  "revamp_summary": "2-4 sentences describing what you improved and why it is now stronger for {target_role} roles.",
  "plain_text_cv": "The complete revamped CV as clean plain text — every section, ready to copy or download."
}}

- Omit optional sections only if the candidate genuinely has no content for them
  (e.g. no projects). Never omit experience, skills, summary, or education if the
  original has any related content."""
