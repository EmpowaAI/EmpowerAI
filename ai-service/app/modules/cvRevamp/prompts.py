import json


def build_cv_revamp_prompt(
    cv_text: str,
    analysis: dict,
    target_role: str,
    industry: str
) -> str:

    cv_text = (cv_text or "")[:12000]

    weaknesses = analysis.get("skills_analysis", {}).get("skill_gaps", [])
    missing_keywords = analysis.get("missing_keywords", {})
    grammar_issues = analysis.get("grammar_feedback", {}).get("issues", [])
    weak_bullets = analysis.get("achievement_improvements", [])
    ats_issues = (
        analysis.get("ats_compatibility", {}).get("parsing_issues", [])
        + analysis.get("ats_compatibility", {}).get("formatting_problems", [])
    )
    missing_sections = analysis.get("ats_compatibility", {}).get("missing_sections", [])
    recommendations = analysis.get("improvement_recommendations", {})
    formatting_issues = analysis.get("formatting_analysis", {}).get("issues", [])
    recruiter_concerns = analysis.get("recruiter_feedback", {}).get("concerns", [])

    critical_keywords = missing_keywords.get("critical", [])
    recommended_keywords = missing_keywords.get("recommended", [])
    industry_keywords = missing_keywords.get("industry_specific", [])

    return f"""
You are an elite CV writer and career coach specializing in the {industry} industry.

Your task:
Rewrite the CV into a fully ATS-optimized, professional, and improved version.

TARGET ROLE: {target_role}
INDUSTRY: {industry}

ORIGINAL CV:
\"\"\"
{cv_text}
\"\"\"

ANALYSIS DATA (MUST FOLLOW STRICTLY):
Skill gaps:
{json.dumps(weaknesses, indent=2)}

Critical keywords:
{json.dumps(critical_keywords)}

Recommended keywords:
{json.dumps(recommended_keywords)}

Industry keywords:
{json.dumps(industry_keywords)}

Grammar issues:
{json.dumps(grammar_issues, indent=2)}

Weak bullets:
{json.dumps(weak_bullets, indent=2)}

ATS issues:
{json.dumps(ats_issues, indent=2)}

Missing sections:
{json.dumps(missing_sections, indent=2)}

Formatting issues:
{json.dumps(formatting_issues, indent=2)}

Recruiter concerns:
{json.dumps(recruiter_concerns, indent=2)}

Improvement recommendations:
{json.dumps(recommendations, indent=2)}

═══════════════════════════════════════════════
RULES
═══════════════════════════════════════════════
- Do NOT invent experience, companies, or degrees
- Do NOT hallucinate metrics
- Only improve based on provided CV content
- Use strong action verbs
- Make CV ATS optimized
- Return ONLY valid JSON

OUTPUT FORMAT:
Return ONLY JSON with:
- revamped_cv
- revamp_summary
- plain_text_cv
"""