import requests
import json

# Test with text
cv_text = """
John Doe
Software Developer

Summary: Experienced software developer with 5 years of experience in Python and JavaScript.

Education:
Bachelor of Science in Computer Science, University of Technology, 2018-2022

Experience:
Software Developer at Tech Company, 2022-Present
- Developed web applications using React and Node.js
- Improved application performance by 30%

Skills: Python, JavaScript, React, Node.js, SQL, Git
"""

response = requests.post(
    "http://localhost:8000/api/cv/analyze",
    json={"cvText": cv_text}
)

print("Status:", response.status_code)
print("Response:", json.dumps(response.json(), indent=2))