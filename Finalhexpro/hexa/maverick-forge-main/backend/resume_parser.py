import os
import io
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
from PyPDF2 import PdfReader
from docx import Document

# --- Configuration ---
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("⚠️  GEMINI_API_KEY not found in .env file. Using fallback mode.")
    genai = None
else:
    genai.configure(api_key=GEMINI_API_KEY)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# --- Resume Text Extraction Utilities ---
def extract_text_from_pdf(pdf_file):
    """Extracts text from a PDF file."""
    text = ""
    try:
        reader = PdfReader(pdf_file)
        for page in reader.pages:
            text += page.extract_text() or ""
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
    return text

def extract_text_from_docx(docx_file):
    """Extracts text from a DOCX file."""
    text = ""
    try:
        document = Document(docx_file)
        for paragraph in document.paragraphs:
            text += paragraph.text + "\n"
    except Exception as e:
        print(f"Error extracting text from DOCX: {e}")
    return text

# --- Fallback skill extraction (when AI is not available) ---
def extract_skills_fallback(resume_text):
    """Extract skills using basic text analysis when AI is not available."""
    common_skills = [
        'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'Git',
        'HTML', 'CSS', 'TypeScript', 'Angular', 'Vue.js', 'Express.js',
        'MongoDB', 'PostgreSQL', 'MySQL', 'Docker', 'AWS', 'Azure',
        'Problem Solving', 'Teamwork', 'Communication', 'Leadership',
        'Project Management', 'Agile', 'Scrum', 'REST API', 'GraphQL',
        'Machine Learning', 'Data Analysis', 'UI/UX Design'
    ]

    extracted_skills = []
    lower_text = resume_text.lower()

    for skill in common_skills:
        if skill.lower() in lower_text:
            extracted_skills.append(skill)

    # Add some skills based on text patterns
    if 'programming' in lower_text or 'coding' in lower_text:
        extracted_skills.append('Programming')
    if 'database' in lower_text or 'db' in lower_text:
        extracted_skills.append('Database Management')
    if 'web' in lower_text or 'frontend' in lower_text or 'backend' in lower_text:
        extracted_skills.append('Web Development')
    if 'mobile' in lower_text or 'app' in lower_text:
        extracted_skills.append('Mobile Development')

    return extracted_skills if len(extracted_skills) > 0 else ['General Programming', 'Problem Solving']

# --- Gemini AI Integration ---
def get_gemini_skills(resume_text):
    """Uses Gemini to extract skills from resume text."""
    if not genai:
        print("Using fallback skill extraction")
        skills = extract_skills_fallback(resume_text)
        return {"skills": skills, "mode": "fallback"}

    try:
        model = genai.GenerativeModel('models/gemini-1.5-flash-latest')

        # Optimized prompt for fresher skill extraction
        prompt = f"""
        You are an expert resume parser for entry-level candidates (freshers).
        Analyze the following resume text and extract all relevant technical skills, programming languages, frameworks, tools, and important soft skills.
        Focus exclusively on skills. Do NOT include personal details, education history, work experience descriptions, project details, or any other non-skill information.
        Provide the output as a JSON array of strings, where each string is a unique skill.
        Ensure skills are concise and directly identifiable.

        Resume Text:
        ---
        {resume_text}
        ---

        Example Expected Output Format:
        ["Python", "Java", "React.js", "SQL", "Git", "Problem Solving", "Teamwork", "Communication"]
        """
        
        response = model.generate_content(prompt)
        # Gemini sometimes wraps JSON in markdown, extract it if present.
        response_text = response.text.strip()
        if response_text.startswith("```json") and response_text.endswith("```"):
            response_text = response_text[7:-3].strip()

        # Attempt to parse as JSON. If it's a list, wrap it in a dict for consistency.
        parsed_data = json.loads(response_text)
        if isinstance(parsed_data, list):
            return {"skills": parsed_data, "mode": "ai"}
        else:  # If Gemini returns an object for some reason, try to find a 'skills' key
            return parsed_data if "skills" in parsed_data and isinstance(parsed_data["skills"], list) else {"skills": [], "mode": "ai"}

    except json.JSONDecodeError:
        print(f"Gemini response was not valid JSON: {response_text}")
        skills = extract_skills_fallback(resume_text)
        return {"skills": skills, "mode": "fallback"}
    except Exception as e:
        print(f"Error calling Gemini API or processing response: {e}")
        skills = extract_skills_fallback(resume_text)
        return {"skills": skills, "mode": "fallback"}

# --- Flask Routes ---
@app.route('/health')
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "OK",
        "message": "Resume parser service is running",
        "aiAvailable": genai is not None,
        "mode": "ai" if genai else "fallback"
    })

@app.route('/parse_resume', methods=['POST'])
def parse_resume():
    """API endpoint to parse an uploaded resume."""
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file provided"}), 400

    resume_file = request.files['resume']
    if resume_file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    file_extension = resume_file.filename.split('.')[-1].lower()
    resume_text = ""

    if file_extension == 'pdf':
        resume_text = extract_text_from_pdf(io.BytesIO(resume_file.read()))
    elif file_extension == 'docx':
        resume_text = extract_text_from_docx(io.BytesIO(resume_file.read()))
    else:
        return jsonify({"error": "Unsupported file type. Please upload a PDF or DOCX."}), 400

    if not resume_text.strip():
        return jsonify({"error": "Could not extract text from the resume. The file might be corrupted or empty."}), 400

    skills_data = get_gemini_skills(resume_text)

    # Return appropriate status code based on whether skills were found or an error occurred
    if "error" in skills_data:
        return jsonify(skills_data), 500
    if not skills_data.get("skills"):
        return jsonify({"skills": [], "message": "No specific skills identified.", "mode": skills_data.get("mode", "unknown")}), 200
    
    return jsonify({
        **skills_data,
        "message": "Skills extracted using basic analysis (AI unavailable)" if skills_data.get("mode") == "fallback" else "Skills extracted using AI analysis"
    }), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 