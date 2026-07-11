from app.core.sanitize import sanitize_for_prompt


def build_cv_analysis_prompt(
    cv_text: str,
    target_role: str,
    industry: str,
    job_description: str | None,
    location: str | None = None,
) -> str:

    job_section = (
        f"\nJOB DESCRIPTION PROVIDED:\n{job_description}\n"
        if job_description
        else "\nNo job description provided. Base analysis only on target role and industry.\n"
    )

    location_note = (
        f"\nCANDIDATE LOCATION: {location}\n"
        if location
        else "\nNo location provided. Use South Africa as default for province projections.\n"
    )

    # Neutralise prompt-injection delivery in the CV text (control chars,
    # fake role markers) before interpolating it into the prompt.
    cv_text = sanitize_for_prompt(cv_text or "", max_chars=12000)
    if job_description:
        job_description = sanitize_for_prompt(job_description, max_chars=4000)
        job_section = f"\nJOB DESCRIPTION PROVIDED:\n{job_description}\n"

    return f"""
You are a senior recruitment consultant and ATS optimization expert with 15+ years of experience.

Your task:
- Analyze the CV strictly
- Extract ONLY factual information
- Do NOT guess or hallucinate anything
- Return ONLY valid JSON

TARGET ROLE: {target_role}
INDUSTRY: {industry}
{location_note}
{job_section}

CV TEXT:
\"\"\"
{cv_text}
\"\"\"

STRICT OUTPUT RULES:
- Output MUST be valid JSON only
- No markdown
- No explanations
- No extra text before or after JSON
- Use null for missing strings
- Use [] for missing arrays
- Do not invent skills, jobs, or education
- All salary figures must be in South African Rands (ZAR)

Return EXACT JSON schema below:

{{
  "ats_compatibility": {{
    "score": 0,
    "grade": "A",
    "parsing_issues": [],
    "formatting_problems": [],
    "missing_sections": [],
    "verdict": ""
  }},
  "overall_score": {{
    "total": 0,
    "breakdown": {{
      "formatting": 0,
      "content_quality": 0,
      "readability": 0,
      "professionalism": 0,
      "grammar": 0
    }},
    "verdict": ""
  }},
  "job_match": {{
    "percentage": null,
    "matching_skills": [],
    "missing_requirements": [],
    "recommended_improvements": []
  }},
  "candidate_info": {{
    "full_name": null,
    "email": null,
    "professional_summary": null,
    "phone": null,
    "location": null,
    "linkedin": null,
    "github": null,
    "portfolio": null,
    "skills": [],
    "education": [],
    "experience": [],
    "certifications": [],
    "projects": []
  }},
  "missing_keywords": {{
    "critical": [],
    "recommended": [],
    "industry_specific": []
  }},
  "skills_analysis": {{
    "detected_technical": [],
    "detected_soft": [],
    "skill_categories": {{}},
    "skill_gaps": [],
    "top_strengths": []
  }},
  "grammar_feedback": {{
    "overall_quality": "Good",
    "issues": []
  }},
  "achievement_improvements": [],
  "formatting_analysis": {{
    "cv_length_pages": 1,
    "length_verdict": "Ideal",
    "issues": [],
    "positives": [],
    "section_order_recommended": []
  }},
  "recruiter_feedback": {{
    "first_impression": "",
    "positives": [],
    "concerns": [],
    "overall_verdict": "Consider"
  }},
  "career_recommendations": {{
    "suitable_roles": [],
    "certifications_to_pursue": [],
    "learning_paths": [],
    "missing_technologies": []
  }},
  "improvement_recommendations": {{
    "critical": [],
    "high_priority": [],
    "nice_to_have": []
  }},

  "salary_prediction": {{
    "currency": "ZAR",
    "entry_level": {{ "min": 0, "max": 0 }},
    "mid_level": {{ "min": 0, "max": 0 }},
    "senior_level": {{ "min": 0, "max": 0 }},
    "candidate_estimated_range": {{ "min": 0, "max": 0 }},
    "basis": ""
  }},

  "interview_questions": {{
    "technical": [],
    "behavioural": [],
    "role_specific": []
  }},

  "linkedin_summary": "",

  "career_roadmap": {{
    "6_months": [],
    "12_months": [],
    "24_months": []
  }},

  "province_earning_projection": {{
    "gauteng": {{ "min": 0, "max": 0 }},
    "western_cape": {{ "min": 0, "max": 0 }},
    "kwazulu_natal": {{ "min": 0, "max": 0 }},
    "eastern_cape": {{ "min": 0, "max": 0 }},
    "limpopo": {{ "min": 0, "max": 0 }},
    "mpumalanga": {{ "min": 0, "max": 0 }},
    "north_west": {{ "min": 0, "max": 0 }},
    "free_state": {{ "min": 0, "max": 0 }},
    "northern_cape": {{ "min": 0, "max": 0 }},
    "currency": "ZAR"
  }},

  "market_benchmarking": {{
    "percentile_rank": 0,
    "vs_average_candidate": "",
    "strengths_vs_market": [],
    "gaps_vs_market": [],
    "demand_level": "High",
    "verdict": ""
  }},

  "career_simulation": {{
    "year_1": {{ "role": "", "expected_salary": 0, "skills_to_gain": [] }},
    "year_3": {{ "role": "", "expected_salary": 0, "skills_to_gain": [] }},
    "year_5": {{ "role": "", "expected_salary": 0, "skills_to_gain": [] }}
  }},

  "cover_letter": ""
}}
"""