# SkillSphere — Phase 2: Backend, Authentication, Database & File Storage Report

## Implemented Endpoints
- **Health**: `GET /api/health` - Reports API status and database connectivity safely.
- **Authentication**:
  - `POST /api/auth/register` - Creates a new user with duplicate email prevention and Werkzeug password hashing.
  - `POST /api/auth/login` - Authenticates user and returns a JWT token (expires in 7 days).
  - `GET /api/auth/me` - Validates JWT and retrieves the authenticated user's minimal profile.
- **Profile & Skills**:
  - `GET /api/profile/` - Retrieves current user's profile.
  - `PUT /api/profile/` - Updates allowed profile fields (name, university, major, bio, avatar).
  - `GET /api/profile/skills` - Retrieves list of user's skills.
  - `POST /api/profile/skills` - Adds a new skill to the user.
  - `DELETE /api/profile/skills/<skill_id>` - Removes a skill from the user.
- **Storage**:
  - `POST /api/storage/upload/document` - Uploads a document to Backblaze B2 and logs metadata in MongoDB.
  - `POST /api/storage/upload/image` - Uploads an image to Cloudinary and logs metadata in MongoDB.

## Database Collections
- **users**: Stores user documents containing profile info, hashed passwords, skills, and progress metrics. The `email` field has a unique index.
- **files**: Stores metadata for uploaded files, including `storage_key`, `provider` (b2/cloudinary), size, format, and ownership references (`uploader_id`).

## Frontend Integrations
- Replaced the mock `localStorage` logic with Axios calls to the real `/api/auth` endpoints.
- Intercepted all Axios requests to inject the JWT `Bearer` token.
- Updated `AppContext.jsx` to fetch the real user profile via `GET /api/auth/me` on application load.
- Added real backend persistence for `addSkill` and `deleteSkill` context methods.

## File-Storage Setup
- **Cloudinary**: Configured via the Python SDK for images. Uploads trigger `secure_url` generation.
- **Backblaze B2**: Configured using `boto3` for S3-compatible API operations.
- Security constraints: Upload routes validate file extensions, size limits (5MB images, 10MB docs), and check for the existence of external configuration variables. Unconfigured instances return a clear `503` configuration error rather than silently failing or faking success.

## Tests Performed
- Automated tests built via `pytest` and `mongomock`.
- Validated duplicate email blocks (`409 Conflict`), hashing correctness, and login authorization constraints (`401 Unauthorized`).
- Tested `PUT` profile updates and `POST`/`DELETE` array manipulations for skills inside the mock DB.
- Tested `api/health` validation and response parsing.

## Commands to Run
**Backend:**
```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python app.py
```

**Frontend:**
```bash
npm install
npm run dev
```

## Known Limitations and Credentials Required
- You must create a MongoDB Atlas cluster and provide the `MONGO_URI` in `backend/.env`.
- You must configure the Cloudinary and B2 S3 keys in `backend/.env` for uploads to function.
- The Dashboard currently merges the real user document (from MongoDB) with mock UI objects (e.g., project recommendations, hackathons) for visual completeness. Full entity migration is required in Phase 3.
- The `seed.py` script requires `DEMO_EMAIL` and `DEMO_PASSWORD` environment variables if you want to bypass the default placeholders.
