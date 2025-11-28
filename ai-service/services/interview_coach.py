"""
Interview Coach Service
Generates interview questions and provides feedback
"""

from typing import List, Dict, Any, Optional
import random
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.ai_client import AIClient

class InterviewCoach:
    """Simulates interviews and provides coaching"""
    
    def __init__(self, ai_client: Optional[AIClient] = None):
        self.ai_client = ai_client or AIClient()
        
        # Fallback question pools
        self.tech_questions = [
            "Explain the difference between let, const, and var in JavaScript.",
            "What is the difference between SQL and NoSQL databases?",
            "How would you optimize a slow database query?",
            "Describe how you would debug a web application issue.",
            "What is version control and why is it important?",
        ]
        self.behavioral_questions = [
            "Tell me about a time you worked in a team.",
            "Describe a challenging situation and how you handled it.",
            "What are your strengths and weaknesses?",
            "Give an example of when you had to learn something new quickly.",
            "How do you handle feedback and criticism?",
        ]
        self.non_tech_questions = [
            "Why do you want to work for this company?",
            "Where do you see yourself in 5 years?",
            "How do you handle stress and pressure?",
            "What motivates you in your work?",
            "Describe your ideal work environment.",
        ]
    
    def generate_question_set(
        self, 
        interview_type: str, 
        difficulty: str = 'medium',
        num_questions: int = 5,
        company: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate interview questions using AI
        """
        questions = []
        
        # Try AI generation first
        if self.ai_client:
            try:
                company_context = f" for {company}" if company else " in South Africa"
                
                prompt = f"""Generate {num_questions} {difficulty} difficulty {interview_type} interview questions{company_context}.
Return only the questions, one per line, without numbering."""
                
                system_prompt = f"You are an interview coach helping youth prepare for {interview_type} interviews in South Africa."
                
                ai_questions_text = self.ai_client.generate_text(
                    prompt,
                    system_prompt,
                    temperature=0.8,
                    max_tokens=300
                )
                
                # Parse questions
                for line in ai_questions_text.split('\n'):
                    line = line.strip()
                    # Remove numbering if present
                    if line and any(c.isalpha() for c in line):
                        # Remove leading numbers/dots
                        while line and (line[0].isdigit() or line[0] in '. )'):
                            line = line[1:].strip()
                        if line and len(line) > 10:
                            questions.append(line)
            except Exception as e:
                print(f"AI question generation error: {e}")
        
        # Fallback to predefined questions
        if len(questions) < num_questions:
            if interview_type == 'tech':
                pool = self.tech_questions
            elif interview_type == 'behavioral':
                pool = self.behavioral_questions
            else:
                pool = self.non_tech_questions
            
            needed = num_questions - len(questions)
            fallback_questions = random.sample(pool, min(needed, len(pool)))
            questions.extend(fallback_questions)
        
        # Format questions
        formatted_questions = []
        for i, q in enumerate(questions[:num_questions]):
            formatted_questions.append({
                'id': f'q{i+1}',
                'question': q,
                'type': interview_type,
                'difficulty': difficulty
            })
        
        return formatted_questions
    
    def evaluate_response(
        self, 
        question: Dict[str, Any],
        response: str
    ) -> Dict[str, Any]:
        """
        Evaluate user's response using AI
        """
        if not response or len(response.strip()) < 10:
            return {
                'questionId': question['id'],
                'response': response,
                'score': 0.3,
                'feedback': "Your response is too short. Please provide more detail.",
                'suggestions': [
                    "Elaborate on your answer with specific examples",
                    "Use the STAR method (Situation, Task, Action, Result)",
                    "Provide concrete details from your experience"
                ]
            }
        
        # Use AI for evaluation
        if self.ai_client:
            try:
                prompt = f"""Evaluate this interview answer on a scale of 0-1 (where 1 is excellent).

Question: {question['question']}
Answer: {response}

Provide:
1. A score (0-1)
2. Brief feedback (1-2 sentences)
3. 2-3 specific suggestions for improvement

Format: Score: X.XX | Feedback: ... | Suggestions: 1) ... 2) ... 3) ..."""
                
                evaluation = self.ai_client.generate_text(
                    prompt,
                    system_prompt="You are an interview coach providing constructive feedback to help youth improve their interview skills.",
                    temperature=0.5,
                    max_tokens=200
                )
                
                # Parse evaluation
                score = 0.7  # Default
                feedback = "Good response. Consider adding more specific examples."
                suggestions = [
                    "Use the STAR method (Situation, Task, Action, Result)",
                    "Provide concrete examples from your experience",
                    "Be concise but comprehensive"
                ]
                
                # Try to extract score
                if "Score:" in evaluation:
                    try:
                        score_part = evaluation.split("Score:")[1].split("|")[0].strip()
                        score = float(score_part)
                    except:
                        pass
                
                # Extract feedback
                if "Feedback:" in evaluation:
                    feedback_part = evaluation.split("Feedback:")[1]
                    if "|" in feedback_part:
                        feedback = feedback_part.split("|")[0].strip()
                    else:
                        feedback = feedback_part.strip()
                
                # Extract suggestions
                if "Suggestions:" in evaluation:
                    suggestions_part = evaluation.split("Suggestions:")[1].strip()
                    suggestions = [s.strip() for s in suggestions_part.split("\n") if s.strip()][:3]
                
                return {
                    'questionId': question['id'],
                    'response': response,
                    'score': round(min(max(score, 0.0), 1.0), 2),
                    'feedback': feedback,
                    'suggestions': suggestions
                }
            except Exception as e:
                print(f"AI evaluation error: {e}")
        
        # Fallback evaluation
        score = min(0.5 + (len(response) / 200) * 0.3, 0.9)
        
        return {
            'questionId': question['id'],
            'response': response,
            'score': round(score, 2),
            'feedback': "Good response. Consider being more specific with examples.",
            'suggestions': [
                "Use the STAR method (Situation, Task, Action, Result)",
                "Provide concrete examples from your experience",
                "Be concise but comprehensive"
            ]
        }
    
    def start_session(
        self, 
        interview_type: str,
        difficulty: str = 'medium',
        company: Optional[str] = None
    ) -> Dict[str, Any]:
        """Start a new interview session"""
        questions = self.generate_question_set(interview_type, difficulty, company=company)
        
        return {
            'sessionId': f'session_{random.randint(1000, 9999)}',
            'type': interview_type,
            'questions': questions,
            'currentQuestionIndex': 0,
            'feedback': []
        }

