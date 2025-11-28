"""
Quick test script for AI Service
Run this to test the service without OpenAI API key (uses fallbacks)
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

def test_digital_twin():
    """Test digital twin generation"""
    print("Testing digital twin generation...")
    user_data = {
        "name": "Asanda",
        "age": 22,
        "province": "Gauteng",
        "skills": ["communication", "teamwork", "customer service"],
        "education": "Matric",
        "interests": ["technology", "design"],
        "experience": "Worked part-time in retail for 6 months"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/twin/generate",
        json=user_data
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        twin = response.json()
        print(f"Empowerment Score: {twin['empowermentScore']}")
        print(f"Recommended Paths: {twin['growthModel']['recommendedPaths']}")
        print(f"Income Projection (12 months): R{twin['incomeProjection']['twelveMonth']}\n")
    else:
        print(f"Error: {response.text}\n")

def test_simulation():
    """Test path simulation"""
    print("Testing path simulation...")
    user_data = {
        "name": "Asanda",
        "age": 22,
        "province": "Gauteng",
        "skills": ["communication", "teamwork"],
        "education": "Matric"
    }
    
    request_data = {
        "user_data": user_data,
        "path_ids": None  # Simulate all paths
    }
    
    response = requests.post(
        f"{BASE_URL}/api/simulation/paths",
        json=request_data
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        paths = response.json()
        print(f"Simulated {len(paths)} paths:")
        for path in paths[:2]:  # Show first 2
            path_name = path.get('pathName', 'Unknown')
            projections = path.get('projections', {})
            twelve_month = projections.get('twelveMonth', {}) if projections else {}
            income = twelve_month.get('income', 0) if twelve_month else 0
            print(f"  - {path_name}: R{income}/month at 12 months")
        print()
    else:
        print(f"Error: {response.text}\n")

def test_cv_analysis():
    """Test CV analysis"""
    print("Testing CV analysis...")
    cv_data = {
        "cvText": """
        ASANDA MTHOMBENI
        Age: 22, Location: Soweto, Gauteng
        
        EDUCATION:
        - Matric (2020)
        
        SKILLS:
        - Communication
        - Teamwork
        - Customer service
        
        EXPERIENCE:
        - Retail Assistant (6 months)
        """,
        "jobRequirements": ["Python", "JavaScript", "Communication"]
    }
    
    response = requests.post(
        f"{BASE_URL}/api/cv/analyze",
        json=cv_data
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        analysis = response.json()
        print(f"Extracted Skills: {len(analysis['extractedSkills'])} skills")
        print(f"Missing Skills: {analysis['missingSkills']}")
        print(f"Suggestions: {len(analysis['suggestions'])} suggestions\n")
    else:
        print(f"Error: {response.text}\n")

def test_interview():
    """Test interview coach"""
    print("Testing interview coach...")
    
    # Start interview
    start_data = {
        "type": "behavioral",
        "difficulty": "medium"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/interview/start",
        json=start_data
    )
    print(f"Start Status: {response.status_code}")
    if response.status_code == 200:
        session = response.json()
        print(f"Session ID: {session['sessionId']}")
        print(f"Questions: {len(session['questions'])} questions")
        
        # Answer first question
        if session['questions']:
            question = session['questions'][0]
            answer_data = {
                "questionId": question['id'],
                "response": "I worked in a team during my retail job. We had to coordinate to serve customers efficiently."
            }
            
            answer_response = requests.post(
                f"{BASE_URL}/api/interview/{session['sessionId']}/answer",
                json=answer_data
            )
            if answer_response.status_code == 200:
                feedback = answer_response.json()
                print(f"Answer Score: {feedback['score']}")
                print(f"Feedback: {feedback['feedback']}\n")
    else:
        print(f"Error: {response.text}\n")

if __name__ == "__main__":
    print("=" * 50)
    print("EmpowerAI AI Service Test Suite")
    print("=" * 50)
    print()
    
    try:
        test_health()
        test_digital_twin()
        test_simulation()
        test_cv_analysis()
        test_interview()
        
        print("=" * 50)
        print("All tests completed!")
        print("=" * 50)
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to service.")
        print("Make sure the AI service is running:")
        print("  cd ai-service")
        print("  uvicorn main:app --reload")
    except Exception as e:
        print(f"Error: {e}")

