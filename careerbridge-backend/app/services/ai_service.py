import os
import json
import google.generativeai as genai
from typing import List, Dict
from app.core.config import settings

def generate_questions(domain: str, count: int = 5) -> List[Dict]:
    """
    Generate a set of multiple choice questions based on a domain using Gemini.
    """
    if not settings.GOOGLE_API_KEY:
        # Return empty so the router falls back to DB questions
        return []

    genai.configure(api_key=settings.GOOGLE_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = f"""
    Generate {count} multiple-choice questions for an internship assessment in the domain of '{domain}'.
    
    Format the response as a valid JSON array of objects. Each object must have:
    - 'question': The question text (string)
    - 'options': An array of exactly 4 strings
    - 'answer_idx': The 0-based index of the correct answer (integer)
    - 'explanation': A brief explanation of why the correct answer is right (string)

    Ensure the questions vary in difficulty and cover core concepts of {domain}.
    Only return the JSON array, no other text.
    """

    try:
        response = model.generate_content(prompt)
        # Clean the response text for potential markdown code blocks
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        
        questions = json.loads(text.strip())
        return questions
    except Exception as e:
        print(f"Error generating AI questions: {e}")
        # Return empty list or fallback to trigger traditional fetch
        return []
