"""
Interview Coach Service – fully async, using Azure OpenAI with proper await.
Generates interview questions based on CV and provides detailed feedback using Azure OpenAI.
"""

from typing import List, Dict, Any, Optional
import random
import json
import sys
import os
import traceback

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.ai_client import AIClient
from utils.logger import get_logger

logger = get_logger()

class InterviewCoach:
    """Simulates interviews and provides coaching based on CV using Azure OpenAI (async)"""

    def __init__(self, ai_client: Optional[AIClient] = None):
        self.ai_client = ai_client or AIClient()

        # Fallback question pools (only used if Azure is unavailable)
        self.fallback_questions = {
            'tech': [
                "Can you describe your experience with web development? What technologies have you worked with?",
                "How do you approach debugging a complex technical issue?",
                "Tell me about a challenging technical project you completed.",
                "How do you stay updated with new technologies?",
                "Explain the difference between SQL and NoSQL databases.",
                "What's your experience with version control systems like Git?",
                "How do you ensure code quality in your projects?",
                "Describe your experience with RESTful API design.",
                "How do you handle state management in your applications?",
                "What is your preferred testing framework and why?",
                "Explain the concept of 'responsive design' in web development.",
                "How would you optimize a slow-loading website?",
                "Describe your experience with cloud platforms (AWS, Azure, GCP).",
                "What is your approach to learning a new programming language or framework?",
                "How do you handle security concerns in your applications?"
            ],
            'behavioral': [
                "Tell me about a time you had to work with a difficult team member.",
                "Describe a situation where you had to meet a tight deadline.",
                "Give an example of when you showed leadership.",
                "Tell me about a time you failed and what you learned.",
                "How do you handle feedback and criticism?",
                "Describe a situation where you had to adapt to significant changes.",
                "Tell me about a time you went above and beyond in your role.",
                "How do you prioritize your work with multiple deadlines?",
                "Describe a conflict you resolved at work.",
                "Give an example of a goal you set and how you achieved it.",
                "How do you handle working under pressure?",
                "Tell me about a time you had to make a difficult decision.",
                "Describe a situation where you had to persuade others to adopt your idea.",
                "How do you stay motivated during repetitive tasks?",
                "Give an example of how you've contributed to team success."
            ],
            'non-tech': [
                "Why are you interested in this position?",
                "What are your greatest strengths?",
                "Where do you see yourself in 5 years?",
                "Describe your ideal work environment.",
                "What motivates you in your work?",
                "How do you handle stress and pressure?",
                "Why should we hire you?",
                "What questions do you have for us?",
                "Tell me about yourself.",
                "What are your salary expectations?",
                "Why do you want to leave your current job?",
                "Describe your work style.",
                "How do you handle criticism from a manager?",
                "What are your weaknesses?",
                "How do you define success?"
            ]
        }

    def _format_cv_context(self, cv_context: Optional[Dict[str, Any]]) -> str:
        """Format CV data into a readable context string"""
        if not cv_context:
            return "No CV data provided."

        sections = cv_context.get('sections', {})
        skills = sections.get('skills', [])
        experience = sections.get('experience', [])
        education = sections.get('education', [])
        achievements = sections.get('achievements', [])
        score = cv_context.get('score', 'N/A')
        level = cv_context.get('readinessLevel', 'N/A')

        # Format experience highlights
        exp_highlights = []
        for exp in experience[:2]:  # Get top 2 experiences
            if exp:
                exp_highlights.append(exp[:150] + "..." if len(exp) > 150 else exp)

        context = f"""
CANDIDATE PROFILE:
- Readiness Score: {score}% ({level})
- Key Skills: {', '.join(skills[:10]) if skills else 'Not specified'}
- Education: {education[0] if education else 'Not specified'}
- Experience Highlights: {' | '.join(exp_highlights) if exp_highlights else 'No experience listed'}
- Key Achievements: {achievements[0] if achievements else 'None listed'}
"""
        return context

    def _format_job_description(self, job_description: Optional[str]) -> str:
        """Format job description for inclusion in prompts"""
        if not job_description or not job_description.strip():
            return ""
        
        # Truncate if too long (to avoid token limits)
        max_length = 2000
        truncated = job_description[:max_length] + "..." if len(job_description) > max_length else job_description
        
        return f"""
JOB DESCRIPTION:
{truncated}

The questions should be tailored to this specific job description, focusing on the skills and responsibilities mentioned.
"""

    async def generate_question_set(
        self,
        interview_type: str,
        difficulty: str = 'medium',
        num_questions: int = 5,
        company: Optional[str] = None,
        cv_context: Optional[Dict[str, Any]] = None,
        job_description: Optional[str] = None  # 👈 NEW parameter
    ) -> List[Dict[str, Any]]:
        """Async generation of questions using Azure AI, optionally tailored to job description."""
        questions = []

        if self.ai_client and self.ai_client.enabled:
            try:
                cv_summary = self._format_cv_context(cv_context)
                job_summary = self._format_job_description(job_description)
                company_context = f" for {company}" if company else ""

                prompt = f"""Generate {num_questions} {difficulty} difficulty {interview_type} interview questions{company_context}.

{cv_summary}
{job_summary}

CRITICAL INSTRUCTIONS:
1. Use the "Key Skills" from the CANDIDATE PROFILE as the basis for at least 3 of the questions.
2. Be tailored to the job description provided (if any)
3. For behavioral questions, reference specific companies or achievements found in their "Experience Highlights".
4. Include follow-up opportunities
5. Be challenging but fair
6. Reference their specific skills and background when possible
7. If a job description is provided, ensure questions assess the key requirements from that job

Return ONLY the questions, one per line, without numbering.
Each question must end with a question mark."""

                system_prompt = f"You are an expert interview coach specializing in {interview_type} interviews. You create personalized questions based on the candidate's CV and the job description."

                logger.info(f"Generating {num_questions} {interview_type} questions with Azure AI" + 
                           (" (with job description)" if job_description else ""))
                
                ai_questions_text = await self.ai_client.generate_text_async(
                    prompt,
                    system_prompt,
                    temperature=0.7,
                    max_tokens=800
                )

                if ai_questions_text:
                    for line in ai_questions_text.split('\n'):
                        line = line.strip()
                        if line and '?' in line and len(line) > 15:
                            # clean up numbering
                            while line and (line[0].isdigit() or line[0] in '. )'):
                                line = line[1:].strip()
                            if line and '?' in line:
                                questions.append(line)
                    logger.info(f"✅ Generated {len(questions)} Azure AI questions")
                else:
                    logger.warning("Azure AI returned empty text for questions")
            except Exception as e:
                logger.error(f"❌ Azure AI question generation error: {e}")
                logger.error(traceback.format_exc())
        else:
            logger.info("Azure AI disabled or not available, using fallback questions")

        # Fallback if needed
        if len(questions) < num_questions:
            pool = self.fallback_questions.get(interview_type, self.fallback_questions['behavioral'])
            needed = num_questions - len(questions)
            fallback_questions = random.sample(pool, min(needed, len(pool)))
            questions.extend(fallback_questions)
            logger.info(f"Added {len(fallback_questions)} fallback questions")

        # Format
        formatted = []
        for i, q in enumerate(questions[:num_questions]):
            formatted.append({
                'id': f'q_{i+1}_{random.randint(1000, 9999)}',
                'text': q,
                'question': q,
                'type': interview_type,
                'difficulty': difficulty
            })
        return formatted

    async def evaluate_response(
        self,
        question: Dict[str, Any],
        response: str,
        cv_context: Optional[Dict[str, Any]] = None,
        job_description: Optional[str] = None  # 👈 NEW parameter (optional, for future use)
    ) -> Dict[str, Any]:
        """Async evaluation with Azure AI. Returns AI feedback with strict scoring."""
        word_count = len(response.split())
        logger.info(f"=== evaluate_response called for question {question.get('id')} ===")
        logger.info(f"AI client enabled: {self.ai_client.enabled if self.ai_client else False}")

        # Try Azure AI first
        if self.ai_client and self.ai_client.enabled:
            try:
                cv_summary = self._format_cv_context(cv_context)
                job_summary = self._format_job_description(job_description) if job_description else ""
                
                skills = []
                if cv_context and cv_context.get('sections'):
                    skills = cv_context['sections'].get('skills', [])

                # Enhanced scoring guidelines to force empty strengths for inadequate answers
                scoring_guidelines = """
SCORING GUIDELINES (BE EXTREMELY STRICT):
- 0-10: COMPLETELY INADEQUATE – Answer is gibberish, extremely short (under 10 words), or totally irrelevant. The candidate has not attempted to answer meaningfully.
- 11-30: VERY POOR – Answer is too brief, off‑topic, or lacks any specific examples.
- 31-50: POOR – Addresses the question but is too generic and lacks detail.
- 51-70: FAIR – Some relevant content but missing key details or structure.
- 71-85: GOOD – Solid answer with relevant examples and structure.
- 86-100: EXCELLENT – Comprehensive, well‑structured answer with quantifiable results.

IMPORTANT: If the answer falls into the 0-10 range (COMPLETELY INADEQUATE), you MUST:
- Set "score" to 0.
- Provide a brief "feedback" explaining why the answer is inadequate.
- Set "strengths" to an empty list [].
- Do NOT list any of the candidate's CV skills as strengths unless they are clearly demonstrated in the answer itself.
"""

                prompt = f"""You are an expert interview coach. Evaluate this interview answer and provide detailed, constructive feedback.

QUESTION: {question['question']}

ANSWER: {response}

{cv_summary}
{job_summary}

Provide a comprehensive evaluation in this EXACT JSON format:
{{
    "score": <number between 0-100>,
    "feedback": "<2-3 sentence overall feedback that references their specific skills and the question>",
    "strengths": ["<strength 1 (if any)>", "<strength 2>", "<strength 3>"],
    "improvements": ["<improvement 1 with specific suggestion>", "<improvement 2>", "<improvement 3>"],
    "suggestedAnswer": "<a model answer that demonstrates excellence, using their skills and the STAR method>"
}}

{scoring_guidelines}

Important rules:
- "strengths" must highlight positive aspects of the answer itself (e.g., specific examples, clarity, structure). If the answer has no strengths, return an empty list [].
- "improvements" should suggest concrete ways to enhance the answer.
- Personalize the feedback using the candidate's CV and the job description (if provided).
- For completely inadequate answers (0-10 range), "strengths" MUST be [] and "score" MUST be 0.
- Use the STAR method in your suggested answer.
- Return ONLY the JSON object, no other text."""

                logger.info(f"Evaluating answer ({word_count} words) with Azure AI")
                evaluation = await self.ai_client.generate_structured_response_async(
                    prompt=prompt,
                    system_prompt="You are an expert interview coach providing detailed, personalized feedback based on the candidate's CV and job description. Always return valid JSON.",
                    response_schema={},
                    temperature=0.3,  # lower for consistency
                    max_tokens=1000
                )

                if evaluation and isinstance(evaluation, dict):
                    logger.info(f"Structured response received: {evaluation}")

                    # Safely convert score to int before comparison
                    raw_score = evaluation.get('score', 0)
                    try:
                        score_val = int(raw_score)
                    except (ValueError, TypeError):
                        score_val = 0

                    # Override strengths for very low scores
                    if score_val < 10 and evaluation.get('strengths'):
                        evaluation['strengths'] = []
                        logger.warning("Overrode strengths for low‑score answer (possible AI misbehavior).")

                    required = ['score', 'feedback', 'strengths', 'improvements', 'suggestedAnswer']
                    missing = [f for f in required if f not in evaluation]
                    if not missing:
                        result = {
                            'questionId': question['id'],
                            'response': response,
                            'score': min(max(int(evaluation.get('score', 0)), 0), 100),
                            'feedback': evaluation.get('feedback', 'Your answer needs improvement.'),
                            'strengths': evaluation.get('strengths', []),
                            'improvements': evaluation.get('improvements', []),
                            'suggestedAnswer': evaluation.get('suggestedAnswer', 'Use the STAR method with specific examples from your experience.')
                        }
                        # Ensure arrays have at least 3 items (pad with empty strings if needed)
                        while len(result['strengths']) < 3:
                            result['strengths'].append("")
                        while len(result['improvements']) < 3:
                            result['improvements'].append("")
                        logger.info(f"✅ Azure AI evaluation complete - Score: {result['score']}")
                        return result
                    else:
                        logger.error(f"Azure AI response missing fields: {missing}")
                else:
                    logger.error(f"❌ Azure AI returned None or invalid structure. Type: {type(evaluation)}")
            except Exception as e:
                logger.error(f"❌ Azure AI evaluation error: {e}")
                logger.error(traceback.format_exc())
        else:
            logger.info("Azure AI disabled, using fallback evaluation")

        # --- FALLBACK EVALUATION (if Azure AI is disabled or fails) ---
        logger.info("Using fallback evaluation due to above issues")
        # Get CV skills for personalization
        skills = []
        if cv_context and cv_context.get('sections'):
            skills = cv_context['sections'].get('skills', [])

        skills_text = f" with your {', '.join(skills[:3])} skills" if skills else ""

        # Check for STAR method keywords
        has_situation = any(word in response.lower() for word in ['situation', 'context', 'when i', 'at work', 'project where'])
        has_task = any(word in response.lower() for word in ['task', 'goal', 'objective', 'needed to', 'had to'])
        has_action = any(word in response.lower() for word in ['action', 'did', 'implemented', 'created', 'developed', 'built'])
        has_result = any(word in response.lower() for word in ['result', 'outcome', 'achieved', 'improved', 'increased'])
        star_count = sum([has_situation, has_task, has_action, has_result])

        # Check for quantifiable results
        has_numbers = any(char.isdigit() for char in response)

        # Calculate score based on multiple factors
        score = 0

        # Word count (max 30 points)
        if word_count >= 150:
            score += 30
        elif word_count >= 100:
            score += 25
        elif word_count >= 75:
            score += 20
        elif word_count >= 50:
            score += 15
        elif word_count >= 30:
            score += 10
        elif word_count >= 10:
            score += 5
        else:
            score += 0  # very short

        # STAR method (max 30 points)
        score += star_count * 7

        # Specific examples (max 20 points)
        if has_numbers:
            score += 20
        elif any(word in response.lower() for word in ['example', 'project', 'experience', 'worked on']):
            score += 15

        # Relevance and quality (max 20 points)
        if len(response.split('.')) >= 3:  # Multiple sentences
            score += 10
        if 'because' in response.lower() or 'so that' in response.lower():  # Explains reasoning
            score += 10

        # Cap at 100
        score = min(score, 100)

        # Generate personalized feedback based on score
        if score >= 80:
            feedback = f"Excellent answer{skills_text}! You provided strong examples and good structure."
            strengths = [
                f"Strong demonstration of {skills[0] if skills else 'your'} skills",
                "Good use of specific examples",
                "Clear communication style"
            ]
            improvements = [
                f"Consider adding more quantifiable results with your {skills[1] if len(skills) > 1 else 'key'} skills",
                "Could expand on the challenges faced",
                "Add more about what you learned"
            ]
        elif score >= 60:
            feedback = f"Good answer{skills_text}. You covered the basics but could add more detail."
            strengths = [
                "Relevant content",
                f"Shows familiarity with {skills[0] if skills else 'the topic'}",
                "Good effort"
            ]
            improvements = [
                "Add more specific examples using STAR method",
                "Include quantifiable results",
                f"Demonstrate deeper expertise in {', '.join(skills[:2]) if skills else 'your area'}"
            ]
        elif score >= 40:
            feedback = f"Fair answer. You need more specific examples and structure{skills_text}."
            strengths = [
                "You addressed the question",
                "Basic understanding shown"
            ]
            improvements = [
                "Use STAR method for better structure",
                f"Reference your experience with {skills[0] if skills else 'relevant technologies'}",
                "Add specific, measurable outcomes"
            ]
        elif score >= 20:
            feedback = f"Poor answer. Your response is too brief and lacks meaningful content{skills_text}."
            strengths = [
                "You attempted to answer"
            ]
            improvements = [
                "Write a much more detailed answer (aim for 150+ words)",
                "Use STAR method with specific examples",
                f"Draw from your experience with {skills[0] if skills else 'your background'}"
            ]
        else:
            feedback = f"Your answer is virtually empty or gibberish. A meaningful response is required."
            strengths = []
            improvements = [
                "Write a detailed answer with at least 50 words",
                "Use STAR method to structure your response",
                f"Include examples from your {skills[0] if skills else 'relevant'} experience"
            ]

        # Ensure strengths and improvements have at least 3 items
        while len(strengths) < 3:
            strengths.append("")
        while len(improvements) < 3:
            improvements.append("")

        # Generate suggested answer based on CV
        suggested_answer = self._generate_suggested_answer(question, cv_context)

        return {
            'questionId': question['id'],
            'response': response,
            'score': score,
            'feedback': feedback,
            'strengths': strengths[:3],
            'improvements': improvements[:3],
            'suggestedAnswer': suggested_answer
        }

    def _generate_suggested_answer(self, question: Dict[str, Any], cv_context: Optional[Dict[str, Any]] = None) -> str:
        """Generate a model answer based on the question and CV (sync helper)."""
        if not cv_context or not cv_context.get('sections'):
            return "A strong answer would follow the STAR method: Situation, Task, Action, Result. Use specific examples from your experience with quantifiable outcomes."

        sections = cv_context.get('sections', {})
        skills = sections.get('skills', [])
        experience = sections.get('experience', [])

        # Create a generic STAR-based answer
        if 'challenge' in question['question'].lower() or 'difficult' in question['question'].lower():
            return f"""Using the STAR method:
Situation: In my previous role, we faced a challenging situation with [describe context].
Task: I needed to [describe your responsibility] using {skills[0] if skills else 'my skills'}.
Action: I took initiative by [describe specific actions], collaborating with the team and implementing [specific solution].
Result: This resulted in [quantifiable outcome], improving our process by [specific percentage] and receiving positive feedback."""

        elif 'project' in question['question'].lower() or 'built' in question['question'].lower():
            return f"""I led a project where we [describe project scope]. Using {', '.join(skills[:3]) if skills else 'various technologies'}, I:
1. Planned and architected the solution
2. Implemented core features including [specific features]
3. Collaborated with [team members/stakeholders]
The project successfully [quantifiable result], and I learned valuable lessons about [key learnings]."""

        else:
            return f"""A strong answer should:
1. Start with context: "In my experience with {skills[0] if skills else 'my field'}..."
2. Provide a specific example using STAR method
3. Highlight your role and contributions
4. Include quantifiable results (e.g., "increased by 30%", "reduced time by 50%")
5. Reflect on what you learned and how you've grown"""

    async def start_session(
        self,
        interview_type: str,
        difficulty: str = 'medium',
        company: Optional[str] = None,
        cv_data: Optional[Dict[str, Any]] = None,
        job_description: Optional[str] = None  # 👈 NEW parameter
    ) -> Dict[str, Any]:
        """Start a new interview session (async) with optional job description."""
        questions = await self.generate_question_set(
            interview_type,
            difficulty,
            company=company,
            cv_context=cv_data,
            job_description=job_description  # 👈 pass it through
        )
        import random
        return {
            'sessionId': f'session_{random.randint(10000, 99999)}',
            'type': interview_type,
            'difficulty': difficulty,
            'company': company,
            'questions': questions,
            'currentQuestionIndex': 0,
            'feedback': [],
            'startedAt': None,
            'cvUsed': bool(cv_data),
            'jobDescriptionUsed': bool(job_description)  # 👈 track if JD was used
        }