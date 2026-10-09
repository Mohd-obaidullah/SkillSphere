# SkillSphere

SkillSphere is a full-stack student networking and collaboration platform, featuring peer matching, study rooms, AI Doubt Solver, project management, and skill testing.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Python, Flask, MongoDB, PyJWT, Google GenAI
- **Storage:** Cloudinary (Images), Backblaze B2 (Documents - Configurable)

## Local Setup

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- MongoDB Atlas Account
- Gemini API Key

### Backend Setup
1. Open a terminal and navigate to the `backend` folder.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and fill in the required environment variables:
   ```env
   FLASK_APP=app.py
   FLASK_ENV=development
   FLASK_RUN_PORT=5000
   SECRET_KEY=your_super_secret_key
   JWT_SECRET_KEY=your_jwt_secret_key

   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<dbname>?retryWrites=true&w=majority
   DB_NAME=skillsphere

   GEMINI_API_KEY=your_gemini_api_key

   # Optional for Image/File Uploads
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Optional for B2 object storage
   B2_S3_ENDPOINT=
   B2_BUCKET_NAME=
   B2_KEY_ID=
   B2_APPLICATION_KEY=
   B2_REGION=
   ```
4. Start the Flask server:
   ```bash
   python app.py
   ```
   *The backend will run on `http://localhost:5000`.*

### Frontend Setup
1. Open a new terminal in the root project directory.
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. (Optional) Create a `.env.production` file for production deployment:
   ```env
   VITE_API_URL=https://your-backend-url.com/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

## Running Tests
To run the backend test suite:
```bash
# From the project root:
export PYTHONPATH="backend" # Or $env:PYTHONPATH="backend" on Windows PowerShell
python -m pytest backend/tests/
```
