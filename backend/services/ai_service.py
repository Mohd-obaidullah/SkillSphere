from google import genai
from flask import current_app
from pydantic import BaseModel, Field
import json

def setup_gemini():
    api_key = current_app.config.get('GEMINI_API_KEY')
    if not api_key:
        return None
    return genai.Client(api_key=api_key)

class DoubtResponse(BaseModel):
    explanation: str
    example: str
    key_points: list[str]
    practice_question: str

def get_doubt_solution(question, context):
    client = setup_gemini()
    if not client:
        return False, "Gemini API key is missing. Contact administrator."

    # Validate inputs
    if not question or len(question) < 5 or len(question) > 500:
        return False, "Question must be between 5 and 500 characters."

    prompt = f"""
You are an AI-assisted Doubt Solver for students studying in a shared room.
Context: {context}
Student Question: {question}

Provide a helpful, educational response formatted as a JSON object.
"""
    try:
        response = client.models.generate_content(
            model='gemini-3.8-flash',
            contents=prompt,
            config={
                'response_mime_type': 'application/json',
                'response_schema': DoubtResponse
            }
        )
        text = response.text.strip()
        
        data = json.loads(text)
        
        return True, data
    except json.JSONDecodeError:
        return False, "The AI returned an invalid response format."
    except Exception as e:
        err_msg = str(e)
        if "503 UNAVAILABLE" in err_msg or "high demand" in err_msg.lower():
            return False, "The AI Doubt Solver is currently experiencing high demand. Please try again in a few moments."
        return False, f"AI service error: {err_msg}"
