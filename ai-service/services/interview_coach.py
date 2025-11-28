"""
Interview Coach Service
Generates interview questions and provides feedback
"""

from typing import List, Dict, Any
import random

class InterviewCoach:
    """Simulates interviews and provides coaching"""
    
    def __init__(self):
        self.tech_questions = [
            "Explain the difference between let, const, and var in JavaScript.",
            "What is the difference between SQL and NoSQL databases?",
            "How would you optimize a slow database query?",
        ]
        self.behavioral_questions = [
            "Tell me about a time you worked in a team.",
            "Describe a challenging situation and how you handled it.",
            "What are your strengths and weaknesses?",
        ]
        self.non_tech_questions = [
            "Why do you want to work for this company?",
            "Where do you see yourself in 5 years?",
            "How do you handle stress and pressure?",
        ]
    
    def generate_question_set(
        self, 
        interview_type: str, 
        difficulty: str = 'medium',
        num_questions: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Generate interview questions
        TODO: Implement with AI generation
        """
        if interview_type == 'tech':
            pool = self.tech_questions
        elif interview_type == 'behavioral':
            pool = self.behavioral_questions
        else:
            pool = self.non_tech_questions
        
        questions = random.sample(pool, min(num_questions, len(pool)))
        
        return [
            {
                'id': f'q{i+1}',
                'question': q,
                'type': interview_type,
                'difficulty': difficulty
            }
            for i, q in enumerate(questions)
        ]
    
    def evaluate_response(
        self, 
        question: Dict[str, Any],
        response: str
    ) -> Dict[str, Any]:
        """
        Evaluate user's response
        TODO: Implement with AI analysis
        """
        # Placeholder evaluation
        score = random.uniform(0.6, 0.9)
        
        feedback = "Good response. Consider being more specific with examples."
        suggestions = [
            "Use the STAR method (Situation, Task, Action, Result)",
            "Provide concrete examples from your experience",
            "Be concise but comprehensive"
        ]
        
        return {
            'questionId': question['id'],
            'response': response,
            'score': round(score, 2),
            'feedback': feedback,
            'suggestions': suggestions
        }
    
    def start_session(
        self, 
        interview_type: str,
        difficulty: str = 'medium'
    ) -> Dict[str, Any]:
        """Start a new interview session"""
        questions = self.generate_question_set(interview_type, difficulty)
        
        return {
            'sessionId': f'session_{random.randint(1000, 9999)}',
            'type': interview_type,
            'questions': questions,
            'currentQuestionIndex': 0,
            'feedback': []
        }

