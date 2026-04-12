"""
Digital Twin Generator
Generates AI-powered economic twins from CV analysis data + available opportunities.
Output maps exactly to the EconomicTwin MongoDB model fields.
"""

from typing import List, Dict, Any, Optional
import sys
import os
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.ai_client import AIClient
from utils.sa_market_data import get_province_multiplier, calculate_adjusted_income


# ── Constants ──────────────────────────────────────────────────────────────────

SENIORITY_THRESHOLDS = {
    "ENTRY": (0, 1),
    "JUNIOR": (1, 3),
    "MID": (3, 6),
    "SENIOR": (6, 10),
    "LEAD": (10, 999),
}

DEMAND_THRESHOLDS = {
    "HIGH": 70,
    "MEDIUM": 40,
    "LOW": 0,
}

SA_INCOME_BANDS = {
    "ENTRY":  {"min": 8_000,  "max": 18_000},
    "JUNIOR": {"min": 18_000, "max": 30_000},
    "MID":    {"min": 30_000, "max": 55_000},
    "SENIOR": {"min": 55_000, "max": 90_000},
    "LEAD":   {"min": 90_000, "max": 150_000},
}

HIGH_DEMAND_SKILLS = {
    "python", "react", "node", "typescript", "kubernetes", "docker",
    "aws", "azure", "gcp", "machine learning", "data science", "fastapi",
    "graphql", "terraform", "ci/cd", "devops", "rust", "go", "flutter",
    "react native", "next.js", "postgresql", "mongodb",
}

MONETIZABLE_SKILLS = {
    "react", "node", "python", "typescript", "fastapi", "flutter",
    "react native", "next.js", "ui/ux", "figma", "data analysis",
    "machine learning", "content creation", "copywriting", "seo",
    "wordpress", "shopify", "excel", "power bi", "tableau",
}


# ── Helpers ────────────────────────────────────────────────────────────────────

def _normalise(skills: Any) -> List[str]:
    """Safely convert any skills value to a list of lowercase strings."""
    if not skills:
        return []
    if isinstance(skills, list):
        return [str(s).strip().lower() for s in skills if s]
    if isinstance(skills, str):
        return [s.strip().lower() for s in skills.split(",") if s.strip()]
    return []


def _infer_seniority(years_experience: int) -> str:
    for level, (lo, hi) in SENIORITY_THRESHOLDS.items():
        if lo <= years_experience < hi:
            return level
    return "ENTRY"


def _demand_level(score: float) -> str:
    for level, threshold in DEMAND_THRESHOLDS.items():
        if score >= threshold:
            return level
    return "LOW"


def _score_employability(
    core_skills: List[str],
    cv_score: float,
    years_experience: int,
    missing_skills: List[str],
) -> float:
    """
    Compute employability score 0–100:
      - CV quality score          40 pts
      - High-demand skill overlap  30 pts
      - Experience weight          20 pts
      - Penalty for missing skills 10 pts (negative)
    """
    cv_component = (cv_score / 100) * 40

    overlap = sum(
        1 for s in core_skills
        if any(hd in s for hd in HIGH_DEMAND_SKILLS)
    )
    demand_component = min(overlap / max(len(core_skills), 1), 1.0) * 30

    exp_component = min(years_experience / 10.0, 1.0) * 20

    penalty = min(len(missing_skills) * 1.5, 10.0)

    return round(min(max(cv_component + demand_component + exp_component - penalty, 0), 100), 2)


def _score_market_value(
    core_skills: List[str],
    seniority: str,
    industry: str,
) -> float:
    """
    Market value score 0–100 based on skill demand + seniority tier.
    """
    seniority_weights = {
        "ENTRY": 0.2, "JUNIOR": 0.4, "MID": 0.6, "SENIOR": 0.8, "LEAD": 1.0
    }
    weight = seniority_weights.get(seniority, 0.2)

    overlap = sum(
        1 for s in core_skills
        if any(hd in s for hd in HIGH_DEMAND_SKILLS)
    )
    skill_ratio = min(overlap / max(len(core_skills), 1), 1.0)

    return round((skill_ratio * 0.6 + weight * 0.4) * 100, 2)


def _income_range(
    seniority: str,
    province: str,
    employability: float,
) -> Dict[str, Any]:
    """
    Return ZAR income range adjusted for SA province multiplier.
    """
    band = SA_INCOME_BANDS.get(seniority, SA_INCOME_BANDS["ENTRY"])
    multiplier = get_province_multiplier(province) if province else 1.0

    skill_boost = 1 + ((employability - 50) / 200)  # ±25% around median

    return {
        "min": round(band["min"] * multiplier * skill_boost),
        "max": round(band["max"] * multiplier * skill_boost),
        "currency": "ZAR",
    }


def _find_missing_skills(
    core_skills: List[str],
    opportunities: List[Dict[str, Any]],
    ai_missing: List[str],
) -> List[str]:
    """
    Derive missing skills from:
      1. Skills required by available opportunities but not in core
      2. AI-identified gaps from CV analysis
    """
    required_by_opportunities: set = set()
    for opp in (opportunities or []):
        for key in ("requiredSkills", "skills", "requirements"):
            raw = opp.get(key, [])
            for s in _normalise(raw):
                required_by_opportunities.add(s)

    missing_from_opps = [
        s for s in required_by_opportunities
        if not any(s in cs or cs in s for cs in core_skills)
    ]

    # Merge with AI-identified gaps, deduplicate
    all_missing = list(dict.fromkeys(ai_missing + missing_from_opps))
    return all_missing[:10]  # Cap at 10


def _find_emerging(core_skills: List[str]) -> List[str]:
    """Skills the user has that are currently trending / high-demand."""
    return [
        s for s in core_skills
        if any(hd in s for hd in HIGH_DEMAND_SKILLS)
    ][:8]


def _find_monetizable(core_skills: List[str]) -> List[str]:
    """Skills with freelance / side-income potential."""
    return [
        s for s in core_skills
        if any(ms in s for ms in MONETIZABLE_SKILLS)
    ][:8]


def _map_job_titles(
    opportunities: List[Dict[str, Any]],
    core_skills: List[str],
    industry: str,
) -> List[str]:
    """Extract job titles from opportunities that overlap with user skills."""
    titles: List[str] = []
    for opp in (opportunities or []):
        title = opp.get("title") or opp.get("jobTitle") or opp.get("role")
        if title:
            titles.append(str(title))
    # Deduplicate, cap at 10
    seen = set()
    unique = []
    for t in titles:
        if t.lower() not in seen:
            seen.add(t.lower())
            unique.append(t)
    return unique[:10]


def _trending_from_opportunities(opportunities: List[Dict[str, Any]]) -> List[str]:
    """Pull trending skills mentioned across available opportunities."""
    freq: Dict[str, int] = {}
    for opp in (opportunities or []):
        for key in ("requiredSkills", "skills", "tags"):
            for s in _normalise(opp.get(key, [])):
                freq[s] = freq.get(s, 0) + 1
    # Return skills mentioned in ≥2 opportunities, sorted by frequency
    trending = sorted([s for s, c in freq.items() if c >= 2], key=lambda s: -freq[s])
    return trending[:10]


# ── Main Generator ─────────────────────────────────────────────────────────────

class DigitalTwinGenerator:
    """
    Generates economic twin data matching the EconomicTwin MongoDB model:

    identity     → currentRole, targetRole, seniorityLevel, industry
    skills       → core, missing, emerging, monetizable
    economy      → employabilityScore, marketValueScore, demandLevel, incomePotentialRange
    intelligence → strengths, weaknesses, opportunities, threats, recommendations
    market       → trendingSkills, decliningSkills, jobTitlesMapped, competitorRoles
    evolution    → version, lastUpdatedBy, confidenceScore
    """

    def __init__(self, ai_client: Optional[AIClient] = None):
        self.ai_client = ai_client or AIClient()

    # ── Public entry point ─────────────────────────────────────────────────────

    def generate_twin(
        self,
        cv_analysis: Dict[str, Any],
        opportunities: Optional[List[Dict[str, Any]]] = None,
        province: str = "Gauteng",
    ) -> Dict[str, Any]:
        """
        Build a twin dict from CV analysis + available opportunities.

        Args:
            cv_analysis:   The full CV analysis object from the AI service.
                           Expected keys (all optional with safe fallbacks):
                             score, readinessLevel, sections.skills,
                             extractedSkills, missingSkills, strengths,
                             weaknesses, recommendations, currentRole,
                             targetRole, industry, yearsExperience,
                             confidenceScore
            opportunities: List of job/opportunity objects from the DB or API.
                           Each may contain: title, requiredSkills, skills,
                           industry, salaryRange, tags
            province:      SA province for income adjustment.

        Returns:
            Dict matching the EconomicTwin model shape.
        """
        opportunities = opportunities or []

        # ── 1. Extract raw CV fields ───────────────────────────────────────────
        cv_score: float = float(cv_analysis.get("score", 0))

        # Core skills — try multiple possible keys
        core_skills: List[str] = _normalise(
            cv_analysis.get("extractedSkills")
            or cv_analysis.get("sections", {}).get("skills")
            or cv_analysis.get("skills")
            or []
        )

        ai_missing: List[str] = _normalise(
            cv_analysis.get("missingSkills")
            or cv_analysis.get("missingKeywords")
            or []
        )

        strengths: List[str] = [
            str(s) for s in (cv_analysis.get("strengths") or []) if s
        ]

        weaknesses: List[str] = [
            str(w) for w in (cv_analysis.get("weaknesses") or []) if w
        ]

        recommendations: List[str] = [
            str(r) for r in (cv_analysis.get("recommendations") or []) if r
        ]

        current_role: str = str(
            cv_analysis.get("currentRole") or "UNDEFINED"
        )

        target_role: str = str(
            cv_analysis.get("targetRole") or "UNDEFINED"
        )

        industry: str = str(
            cv_analysis.get("industry") or "technology"
        ).lower()

        years_exp: int = int(cv_analysis.get("yearsExperience") or 0)

        cv_confidence: float = float(cv_analysis.get("confidenceScore") or 0)

        # ── 2. Derive computed fields ──────────────────────────────────────────
        seniority: str = _infer_seniority(years_exp)

        missing_skills = _find_missing_skills(core_skills, opportunities, ai_missing)
        emerging_skills = _find_emerging(core_skills)
        monetizable_skills = _find_monetizable(core_skills)

        employability = _score_employability(core_skills, cv_score, years_exp, missing_skills)
        market_value = _score_market_value(core_skills, seniority, industry)
        demand = _demand_level(employability)

        income_range = _income_range(seniority, province, employability)

        job_titles = _map_job_titles(opportunities, core_skills, industry)
        trending = _trending_from_opportunities(opportunities)

        # Opportunities & threats derived from available jobs vs skill gaps
        opp_list: List[str] = []
        for s in emerging_skills[:3]:
            count = sum(1 for o in opportunities if s.lower() in str(o).lower())
            if count > 0:
                opp_list.append(f"{s.title()} skills are actively sought across {count}+ open positions")
        
        # Fallback if no opportunities detected
        if not opp_list:
            opp_list = [
                "Build foundational technical skills to compete in the SA market",
                "Develop specialisation in your chosen industry"
            ]
        
        threats_list: List[str] = []
        for s in missing_skills[:3]:
            count = sum(1 for o in opportunities if s.lower() in str(o).lower())
            if count > 0:
                threats_list.append(f"'{s.title()}' is in demand but missing from your profile ({count}+ listings require it)")
        
        # Fallback if no threats detected
        if not threats_list and missing_skills:
            threats_list = [
                f"Upskilling in {missing_skills[0]} would significantly enhance market competitiveness"
            ]

        # Confidence: average of CV confidence + data completeness
        data_completeness = min(
            (
                (1 if core_skills else 0) +
                (1 if strengths else 0) +
                (1 if weaknesses else 0) +
                (1 if recommendations else 0) +
                (1 if current_role != "UNDEFINED" else 0)
            ) / 5.0, 1.0
        ) * 100
        confidence_score = round((cv_confidence + data_completeness) / 2, 2)

        # ── 3. Assemble twin matching the model schema ─────────────────────────
        return {
            "identity": {
                "currentRole": current_role,
                "targetRole": target_role,
                "seniorityLevel": seniority,
                "industry": industry,
            },
            "skills": {
                "core": core_skills,
                "missing": missing_skills,
                "emerging": emerging_skills,
                "monetizable": monetizable_skills,
            },
            "economy": {
                "employabilityScore": employability,
                "marketValueScore": market_value,
                "demandLevel": demand,
                "incomePotentialRange": income_range,
            },
            "intelligence": {
                "strengths": strengths or [
                    "Detail-oriented and methodical approach",
                    "Willing to continuously learn new skills",
                    "Capable of meeting deadlines and delivery targets"
                ],
                "weaknesses": weaknesses or [
                    "Limited market-specific experience",
                    "Opportunity to expand technical breadth"
                ],
                "opportunities": opp_list or [
                    "Growing demand for digital skills in South Africa",
                    "Opportunity to specialize in emerging technologies"
                ],
                "threats": threats_list or [
                    "Competitive job market requires continued skill development",
                    "Importance of building professional network early"
                ],
                "recommendations": recommendations or [
                    "Build a portfolio demonstrating practical skills",
                    "Obtain industry-recognized certifications",
                    "Network actively within your industry",
                    "Contribute to open-source projects or freelance work",
                    "Stay updated with latest market trends in your field"
                ],
            },
            "market": {
                "trendingSkills": trending,
                "decliningSkills": [],          # Populated by AI enrichment later
                "jobTitlesMapped": job_titles,
                "competitorRoles": [],          # Populated by AI enrichment later
            },
            "evolution": {
                "version": 1,
                "lastUpdatedBy": "cv_analyzer",
                "confidenceScore": confidence_score,
            },
            "status": "ACTIVE",
        }

    # ── Optional: AI-enriched twin (calls Azure OpenAI for deeper analysis) ────

    def generate_twin_with_ai(
        self,
        cv_analysis: Dict[str, Any],
        opportunities: Optional[List[Dict[str, Any]]] = None,
        province: str = "Gauteng",
    ) -> Dict[str, Any]:
        """
        Generate base twin then enrich economy + market fields via AI.
        Falls back to base twin if AI call fails.
        """
        base = self.generate_twin(cv_analysis, opportunities, province)

        if not self.ai_client:
            return base

        try:
            # Detailed profile context for AI enrichment
            current_role = base['identity']['currentRole'] or 'Not Specified'
            target_role = base['identity']['targetRole'] or 'Career Advancement'
            core_skills_str = ', '.join(base['skills']['core'][:15]) or 'General'
            missing_skills_str = ', '.join(base['skills']['missing'][:5]) or 'None identified'
            
            prompt = f"""
You are an expert career analyst specializing in the South African job market. 
Your task is to enrich a user's digital twin profile with accurate, personalized insights.

CRITICAL: Ensure all outputs are specific to THIS person's profile, NOT generic.
Use the provided data to create meaningful, differentiated recommendations.

Given this career profile, return a JSON object with these fields only:
- employabilityScore (0-100 integer): rate based on skills match + seniority + market demand
- marketValueScore (0-100 integer): estimated earning power relative to SA market
- demandLevel ("HIGH" | "MEDIUM" | "LOW"): based on skills + industry + experience
- incomeProjection: {{ min, max, currency: "ZAR" }}: realistic ZAR ranges for this profile
- emergingSkills: string[]: 2-4 trending skills TO ACQUIRE based on industry
- monetizable: string[]: 2-4 skills with freelance/passive income potential
- trendingSkills: string[]: 3-5 most in-demand skills in {base['identity']['industry']} industry right now
- decliningSkills: string[]: 1-3 skills losing market relevance
- competitorRoles: string[]: 2-4 similar job titles competitors hold
- confidenceScore (0-100): confidence in this assessment

SPECIFIC PROFILE DATA:
- Current Role: {current_role}
- Target Role: {target_role}
- Years of Experience: {cv_analysis.get('yearsExperience', 0)} years
- Seniority Level: {base['identity']['seniorityLevel']}
- Core Skills: {core_skills_str}
- Skill Gaps: {missing_skills_str}
- Industry Focus: {base['identity']['industry'].title()}
- CV Quality Score: {cv_analysis.get('score', 0)}/100
- Province: {province}
- Market Opportunities: {len(opportunities or [])} matching roles found

INSTRUCTIONS:
1. If core skills are strong and aligned with industry, score employability HIGH (75-90+)
2. If missing critical skills or gaps exist, recommend targeted upskilling in missing_skills
3. Provide income ranges realistic for {province} market and seniority level
4. Identify 2-3 emerging skills that will boost their competitiveness in {base['identity']['industry']}
5. ALL outputs must relate directly to this person's data - NO generic fallbacks

Return ONLY valid JSON. No explanation, no code blocks.
""".strip()

            raw = self.ai_client.complete(prompt)

            # Strip markdown fences if present
            clean = raw.strip()
            if clean.startswith("```"):
                clean = clean.split("```")[1]
                if clean.startswith("json"):
                    clean = clean[4:]
            clean = clean.strip()

            ai_data: Dict[str, Any] = json.loads(clean)

            # Merge AI data into base twin
            income = ai_data.get("incomeProjection", {})
            base["economy"]["employabilityScore"] = ai_data.get("employabilityScore", base["economy"]["employabilityScore"])
            base["economy"]["marketValueScore"] = ai_data.get("marketValueScore", base["economy"]["marketValueScore"])
            base["economy"]["demandLevel"] = ai_data.get("demandLevel", base["economy"]["demandLevel"])
            if income:
                base["economy"]["incomePotentialRange"] = {
                    "min": income.get("min", base["economy"]["incomePotentialRange"]["min"]),
                    "max": income.get("max", base["economy"]["incomePotentialRange"]["max"]),
                    "currency": "ZAR",
                }

            if ai_data.get("emergingSkills"):
                base["skills"]["emerging"] = ai_data["emergingSkills"]
            if ai_data.get("monetizable"):
                base["skills"]["monetizable"] = ai_data["monetizable"]
            if ai_data.get("trendingSkills"):
                base["market"]["trendingSkills"] = ai_data["trendingSkills"]
            if ai_data.get("decliningSkills"):
                base["market"]["decliningSkills"] = ai_data["decliningSkills"]
            if ai_data.get("competitorRoles"):
                base["market"]["competitorRoles"] = ai_data["competitorRoles"]
            if ai_data.get("confidenceScore"):
                base["evolution"]["confidenceScore"] = ai_data["confidenceScore"]

            base["evolution"]["lastUpdatedBy"] = "ai_enrichment"

        except Exception as e:
            print(f"[TwinGenerator] AI enrichment failed, using base twin: {e}")

        return base
