# SkillSphere — Phase 4: Real AI Integration & Doubt Assistant Report

## Overview
In this phase, an **AI-assisted Doubt Solver** was integrated into the SkillSphere application. It enables students to seek immediate AI assistance (explanations, examples, and practice questions) on challenging topics directly within their shared Study Groups.

## Features Implemented
1. **AI Service Module (`backend/services/ai_service.py`)**
   - Utilizes the officially supported `google-genai` Python library.
   - Securely reads the `GEMINI_API_KEY` from the backend environment.
   - Enforces structured JSON outputs using `response_schema` (Pydantic `BaseModel`) for reliable frontend parsing.
   - Handles network errors and invalid length queries gracefully.

2. **Doubt-Solving Endpoint (`POST /api/rooms/<room_id>/ai-help`)**
   - Integrates with the existing `rooms_bp` Blueprint.
   - Enforces room membership verification: only authenticated students who belong to the room can ask the AI questions.
   - Combines the user's `question` with the room's `subject` and `title` context.

3. **Frontend Integration (`StudyNotes.jsx` and `api.js`)**
   - Added an **AI Doubt Solver** interface directly inside the Room view.
   - Features a dedicated input field with responsive loading states ("Thinking...").
   - Neatly formats the AI's explanation, example, key points, and optional practice question.
   - Implemented a **"Share to Room"** button that lets students voluntarily push a helpful AI answer to the general Room Discussions feed for everyone else to learn from.

## Safeguards & Security
- **Authentication**: All requests require a valid JWT token.
- **Authorization**: The endpoint blocks requests to private rooms if the user is not a verified member.
- **API Key Security**: The Gemini API key remains strictly on the server (`.env`) and is never exposed to the React frontend.
- **Validation**: Requests shorter than 5 characters or longer than 500 characters are instantly rejected by the backend to avoid unnecessary token consumption.
- **Fallback Handling**: If the API key is missing (or exhausted), the application catches the failure and returns a `503 Service Unavailable` message cleanly to the UI. The rest of the Study Room features (discussions, members, resources) continue to function perfectly.

## Environment Variables Required
The backend requires the following addition in `backend/.env`:
```
GEMINI_API_KEY=your_real_gemini_api_key_here
```

## Testing Performed
An automated test suite was added to `backend/tests/test_ai.py` utilizing `pytest` and `mongomock`.
Test cases executed and passed:
- `test_missing_api_key`: Verifies graceful failure with a 503 code.
- `test_successful_ai_response`: Mocks the `genai.Client` and confirms correct routing and JSON processing.
- `test_invalid_json_format`: Tests resilience against improperly formatted mock answers.
- `test_unauthorized_room_access`: Prevents non-members from extracting context.
- `test_invalid_question_length`: Rejects empty or oversized queries.

## Known Limitations
- Gemini API keys have rate limits. High concurrency may result in 429 Too Many Requests errors which are surfaced to the user.
- The shared AI context is currently limited to the room's subject and title. It does not aggressively read all past room messages to preserve API tokens and privacy, but this could be scaled up later.
