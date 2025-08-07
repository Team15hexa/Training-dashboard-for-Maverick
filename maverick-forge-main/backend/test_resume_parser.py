#!/usr/bin/env python3
"""
Standalone resume parser test script
This demonstrates the resume parsing functionality without needing the Flask server
"""

import requests
import os

def test_resume_parser():
    """Test the resume parser API"""
    
    # Test health endpoint
    print("Testing health endpoint...")
    try:
        response = requests.get('http://localhost:5001/health')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return

    # Test resume parsing with a mock file
    print("\nTesting resume parsing...")
    try:
        # Create a mock resume content
        mock_resume_content = """
        John Doe
        Software Engineer
        
        SKILLS:
        - JavaScript
        - React.js
        - Node.js
        - Python
        - SQL
        - Git
        - HTML/CSS
        - TypeScript
        - Express.js
        - MongoDB
        
        EXPERIENCE:
        Software Developer Intern at TechCorp
        - Developed web applications using React and Node.js
        - Worked with REST APIs and databases
        - Collaborated with team using Git
        
        EDUCATION:
        Bachelor of Science in Computer Science
        University of Technology
        GPA: 3.8/4.0
        
        PROJECTS:
        - E-commerce website using React and Node.js
        - Weather app using JavaScript and APIs
        - Database management system using SQL
        
        SOFT SKILLS:
        - Problem Solving
        - Teamwork
        - Communication
        - Leadership
        - Project Management
        """
        
        # Create a mock file
        with open('test_resume.txt', 'w', encoding='utf-8') as f:
            f.write(mock_resume_content)
        
        # Test the parse endpoint
        with open('test_resume.txt', 'rb') as f:
            files = {'resume': ('test_resume.txt', f, 'text/plain')}
            response = requests.post('http://localhost:5001/parse_resume', files=files)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Resume parsing successful!")
            print(f"Skills extracted: {data.get('skills', [])}")
            print(f"Mode: {data.get('mode', 'unknown')}")
            print(f"Message: {data.get('message', '')}")
        else:
            print(f"❌ Resume parsing failed: {response.status_code}")
            print(f"Error: {response.text}")
        
        # Clean up test file
        os.remove('test_resume.txt')
        
    except Exception as e:
        print(f"❌ Resume parsing error: {e}")

if __name__ == "__main__":
    test_resume_parser() 