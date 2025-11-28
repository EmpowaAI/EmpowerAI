"""
Comprehensive Test Suite for EmpowerAI AI Service
Tests all endpoints with Asanda's example from the proposal
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

def test_health():
    """Test health endpoint"""
    print_section("1. Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"[OK] Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return False

def test_digital_twin_asanda():
    """Test Digital Twin with Asanda's example"""
    print_section("2. Digital Twin - Asanda's Example")
    
    asanda_data = {
        "name": "Asanda",
        "age": 22,
        "province": "Gauteng",
        "skills": ["communication", "teamwork", "customer service"],
        "education": "Matric",
        "interests": ["technology", "design"],
        "experience": "Worked part-time in retail for 6 months"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/twin/generate",
            json=asanda_data,
            timeout=10
        )
        
        if response.status_code == 200:
            twin = response.json()
            print(f"[OK] Twin Generated Successfully")
            print(f"\n   Empowerment Score: {twin['empowermentScore']}/100")
            print(f"   Income Projections:")
            print(f"      - 3 months:  R{twin['incomeProjection']['threeMonth']:,.2f}")
            print(f"      - 6 months:  R{twin['incomeProjection']['sixMonth']:,.2f}")
            print(f"      - 12 months: R{twin['incomeProjection']['twelveMonth']:,.2f}")
            print(f"\n   Recommended Paths:")
            for i, path in enumerate(twin['growthModel']['recommendedPaths'], 1):
                print(f"      {i}. {path}")
            print(f"\n   Skill Vector: {[round(v, 2) for v in twin['skillVector']]}")
            print(f"   Employability Index: {twin['growthModel']['employabilityIndex']:.2f}")
            return True, twin
        else:
            print(f"[ERROR] Error: {response.status_code}")
            print(f"   {response.text}")
            return False, None
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return False, None

def test_simulation_asanda(twin_data=None):
    """Test Path Simulation with Asanda's data"""
    print_section("3. Path Simulation - Asanda's Example")
    
    asanda_data = {
        "name": "Asanda",
        "age": 22,
        "province": "Gauteng",
        "skills": ["communication", "teamwork", "customer service"],
        "education": "Matric"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/simulation/paths",
            json={"user_data": asanda_data},
            timeout=15
        )
        
        if response.status_code == 200:
            paths = response.json()
            print(f"[OK] Simulated {len(paths)} Career Paths\n")
            
            # Show top 3 paths by 12-month income
            def get_income(path):
                try:
                    proj = path.get('projections', {})
                    if proj:
                        twelve = proj.get('twelveMonth')
                        if twelve and isinstance(twelve, dict):
                            return twelve.get('income', 0)
                    return 0
                except:
                    return 0
            
            sorted_paths = sorted(paths, key=get_income, reverse=True)
            
            for i, path in enumerate(sorted_paths[:3], 1):
                path_name = path.get('pathName', 'Unknown')
                projections = path.get('projections', {})
                twelve_month = projections.get('twelveMonth', {})
                
                if twelve_month and isinstance(twelve_month, dict):
                    income = twelve_month.get('income', 0)
                    skill_growth = twelve_month.get('skillGrowth', 0)
                    employability = twelve_month.get('employabilityIndex', 0)
                    
                    print(f"   {i}. {path_name}")
                    print(f"      12-month income: R{income:,.2f}/month")
                    print(f"      Skill growth: {skill_growth:.2%}")
                    print(f"      Employability: {employability:.2%}")
                    if twelve_month.get('milestones'):
                        print(f"      Milestones: {len(twelve_month['milestones'])} milestones")
                    print()
                else:
                    print(f"   {i}. {path_name} - Data formatting issue")
                    print(f"      Raw data: {json.dumps(twelve_month)[:100]}")
                    print()
            
            return True, paths
        else:
            print(f"[ERROR] Error: {response.status_code}")
            print(f"   {response.text}")
            return False, None
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()
        return False, None

def test_best_path_asanda():
    """Test Best Path recommendation"""
    print_section("4. Best Path Recommendation")
    
    asanda_data = {
        "name": "Asanda",
        "age": 22,
        "province": "Gauteng",
        "skills": ["communication", "teamwork"],
        "education": "Matric"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/simulation/best-path",
            json=asanda_data,
            timeout=15
        )
        
        if response.status_code == 200:
            best_path = response.json()
            print(f"[OK] Best Path Found")
            print(f"\n   Recommended: {best_path.get('pathName', 'Unknown')}")
            print(f"   Description: {best_path.get('description', 'N/A')}")
            
            projections = best_path.get('projections', {})
            twelve_month = projections.get('twelveMonth', {})
            if twelve_month and isinstance(twelve_month, dict):
                income = twelve_month.get('income', 0)
                print(f"   12-month income: R{income:,.2f}/month")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   {response.text}")
            return False
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return False

def test_cv_analysis():
    """Test CV Analysis"""
    print_section("5. CV Analysis")
    
    cv_text = """
    ASANDA MTHOMBENI
    Age: 22, Location: Soweto, Gauteng
    
    EDUCATION:
    - Matric (2020)
    - Currently learning web development basics
    
    SKILLS:
    - Communication
    - Teamwork
    - Customer service
    - Basic computer skills
    
    EXPERIENCE:
    - Retail Assistant (6 months part-time)
      - Served customers
      - Handled cash transactions
      - Maintained store displays
    
    INTERESTS:
    - Technology
    - Design
    - Learning new skills
    """
    
    job_requirements = ["Python", "JavaScript", "Communication", "Problem Solving"]
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/cv/analyze",
            json={
                "cvText": cv_text,
                "jobRequirements": job_requirements
            },
            timeout=10
        )
        
        if response.status_code == 200:
            analysis = response.json()
            print(f"[OK] CV Analysis Complete\n")
            print(f"   Extracted Skills ({len(analysis['extractedSkills'])}):")
            for skill in analysis['extractedSkills'][:8]:
                print(f"      - {skill}")
            
            if analysis['missingSkills']:
                print(f"\n   Missing Skills ({len(analysis['missingSkills'])}):")
                for skill in analysis['missingSkills']:
                    print(f"      - {skill}")
            
            if analysis['suggestions']:
                print(f"\n   Suggestions ({len(analysis['suggestions'])}):")
                for i, suggestion in enumerate(analysis['suggestions'][:3], 1):
                    print(f"      {i}. {suggestion}")
            
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   {response.text}")
            return False
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return False

def test_interview_coach():
    """Test Interview Coach"""
    print_section("6. Interview Coach")
    
    try:
        # Start interview
        start_response = requests.post(
            f"{BASE_URL}/api/interview/start",
            json={
                "type": "behavioral",
                "difficulty": "medium"
            },
            timeout=10
        )
        
        if start_response.status_code == 200:
            session = start_response.json()
            print(f"[OK] Interview Session Started")
            print(f"   Session ID: {session['sessionId']}")
            print(f"   Type: {session['type']}")
            print(f"   Questions: {len(session['questions'])}")
            
            # Show first question
            if session['questions']:
                first_q = session['questions'][0]
                print(f"\n   Sample Question:")
                print(f"      {first_q['question']}")
                print(f"      Difficulty: {first_q['difficulty']}")
                
                # Submit an answer
                answer_response = requests.post(
                    f"{BASE_URL}/api/interview/{session['sessionId']}/answer",
                    json={
                        "questionId": first_q['id'],
                        "response": "I worked in a team during my retail job. We had to coordinate to serve customers efficiently during busy periods. I learned to communicate clearly and help my colleagues when needed."
                    },
                    timeout=10
                )
                
                if answer_response.status_code == 200:
                    feedback = answer_response.json()
                    print(f"\n   [OK] Answer Evaluated")
                    print(f"      Score: {feedback['score']:.2f}/1.0")
                    print(f"      Feedback: {feedback['feedback']}")
                    if feedback['suggestions']:
                        print(f"      Suggestions:")
                        for suggestion in feedback['suggestions'][:2]:
                            print(f"         - {suggestion}")
            
            return True
        else:
            print(f"❌ Error: {start_response.status_code}")
            print(f"   {start_response.text}")
            return False
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return False

def test_performance():
    """Test API response times"""
    print_section("7. Performance Test")
    
    asanda_data = {
        "name": "Asanda",
        "age": 22,
        "province": "Gauteng",
        "skills": ["communication"],
        "education": "Matric"
    }
    
    endpoints = [
        ("Health", "GET", f"{BASE_URL}/health"),
        ("Digital Twin", "POST", f"{BASE_URL}/api/twin/generate", asanda_data),
        ("CV Analysis", "POST", f"{BASE_URL}/api/cv/analyze", {"cvText": "Test CV", "jobRequirements": []}),
    ]
    
    print("   Testing response times (target: < 4 seconds)...\n")
    
    for name, method, url, *data in endpoints:
        try:
            import time
            start = time.time()
            
            if method == "GET":
                response = requests.get(url, timeout=10)
            else:
                response = requests.post(url, json=data[0] if data else {}, timeout=10)
            
            elapsed = time.time() - start
            
            status = "[OK]" if elapsed < 4.0 else "[SLOW]"
            print(f"   {status} {name}: {elapsed:.2f}s ({response.status_code})")
        except Exception as e:
            print(f"   [ERROR] {name}: Error - {e}")

def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("  EmpowerAI AI Service - Comprehensive Test Suite")
    print(f"  Test Run: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    results = {
        "health": False,
        "digital_twin": False,
        "simulation": False,
        "best_path": False,
        "cv_analysis": False,
        "interview": False
    }
    
    # Run tests
    results["health"] = test_health()
    
    twin_success, twin_data = test_digital_twin_asanda()
    results["digital_twin"] = twin_success
    
    sim_success, sim_data = test_simulation_asanda(twin_data)
    results["simulation"] = sim_success
    
    results["best_path"] = test_best_path_asanda()
    results["cv_analysis"] = test_cv_analysis()
    results["interview"] = test_interview_coach()
    
    test_performance()
    
    # Summary
    print_section("Test Summary")
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    for test, result in results.items():
        status = "[PASS]" if result else "[FAIL]"
        print(f"   {status} - {test.replace('_', ' ').title()}")
    
    print(f"\n   Results: {passed}/{total} tests passed ({passed*100//total}%)")
    
    if passed == total:
        print("\n   [SUCCESS] All tests passed! AI Service is ready!")
    else:
        print(f"\n   [WARNING] {total - passed} test(s) failed. Review errors above.")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("\n[ERROR] Could not connect to AI service.")
        print("   Make sure the service is running:")
        print("   cd ai-service")
        print("   venv\\Scripts\\activate")
        print("   uvicorn main:app --reload --port 8000")
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()

