# SkillSphere — Phase 3: Core Features & Backend Integration Report

## Features Implemented & Integrated

1. **Peer Discovery & Matching (`SkillSwaps.jsx` & `/api/peers`)**
   - Connected peer discovery to real MongoDB profiles.
   - Implemented search by name, university, skills, and major.
   - Implemented a deterministic matching algorithm based on shared skills (10 points each) and shared university (20 points).
   - Displayed personalized match reasons (e.g. "Shares skills: React, Python").
   - Implemented a "Connect" request workflow.

2. **Study Groups & Project Rooms (`StudyNotes.jsx` & `/api/rooms`)**
   - Built a room creation flow capturing Title, Description, and Subject.
   - Implemented a "Join Room" workflow adding the authenticated user's ID to the room `members` list.
   - Designed a room detailed view containing Member list, Resource management, and Discussions.
   - Backend enforces membership checks before allowing users to post questions or view internal resources.

3. **Resource Sharing (`StudyNotes.jsx` & `/api/storage`)**
   - Linked room uploads to the existing storage endpoint (`/api/storage/upload/document`).
   - Mapped resources back to the study rooms using the backend storage logic to persist metadata inside MongoDB.

4. **Doubt-Solving Discussions (`StudyNotes.jsx` & `/api/rooms/<id>/questions`)**
   - Implemented persistent Q&A inside study rooms.
   - Authorized members can post and view discussion threads, mapped reliably to their user profiles.

5. **Project Collaboration (`Projects.jsx` & `/api/projects`)**
   - Converted the Projects page to use real MongoDB objects.
   - Added a "Post a Project" modal to define required roles, title, description, and tags.
   - Implemented the "Apply" workflow to push applicants securely to the project document.
   - Prevented users from applying to their own projects or duplicating applications.

6. **Task Management / Workspace (`TeamBoard.jsx` & `/api/projects/<id>/tasks`)**
   - Connected the Kanban board to real persistent tasks on the backend.
   - Filtered available projects for the user to select their active workspace context.
   - Introduced a "New Task" form.
   - Connected task state transitions (`todo` -> `in-progress` -> `done`) via `PUT /api/projects/tasks/<id>`.
   - Retained the client-side Pomodoro timer as requested.

7. **Project & Learning Evidence (`Profile.jsx` & `/api/evidence`)**
   - Replaced the profile stub with a functional view showcasing the logged-in user's data (skills, bio, avatar).
   - Created the "Learning Evidence" component allowing users to log verified or self-declared links (e.g. GitHub repos).
   - Provided full CRUD for evidence.

## Endpoints Created
- **Peers**: `GET /api/peers/`, `POST /api/peers/request/<id>`
- **Projects**: `GET /api/projects/`, `POST /api/projects/`, `POST /api/projects/<id>/apply`, `GET /api/projects/<id>/tasks`, `POST /api/projects/<id>/tasks`, `PUT /api/projects/tasks/<id>`
- **Rooms**: `GET /api/rooms/`, `POST /api/rooms/`, `POST /api/rooms/<id>/join`, `GET /api/rooms/<id>/questions`, `POST /api/rooms/<id>/questions`, `GET /api/rooms/<id>/resources`
- **Evidence**: `GET /api/evidence/`, `POST /api/evidence/`, `DELETE /api/evidence/<id>`

## Tests Executed
I added an integration test suite inside `backend/tests/test_workflows.py`.
It covers the entire set of new flows using `mongomock` and `pytest`:
- `test_peers_discovery`: Asserts match algorithm correctly increases score and surfaces skill reasons.
- `test_projects_flow`: Confirms project creation and successful applicant addition.
- `test_tasks_flow`: Ensures authorized members can transition task statuses and unauthorized members get 403 Forbidden.
- `test_rooms_and_discussions`: Validates room joining and discussion posting rights.
- `test_evidence`: Tests creation and deletion of evidence metadata.

All 5 test suites passed securely without any logic errors. 

## Storage Integration Status
The previously built `/api/storage/` routes continue to govern Backblaze B2 and Cloudinary uploads. The frontend `StudyNotes.jsx` actively pushes `FormData` directly to these routes. Ensure valid keys are present in `.env`, or the Flask backend will return the `503 Service Unavailable` flag gracefully as designed.

## Notes & Minor Limitations
- I utilized the existing `api.js` Axios wrapper to bind all these routes, automatically injecting the JWT.
- "Accept/Reject Applications" for projects is backend-ready (via simple push/pull arrays) but to keep the frontend scope manageable inside this single phase, the owner views are simplified.
- Real-time WebSockets were actively avoided as per the requirements; all updates (moving Kanban tasks, adding questions) trigger a fast subsequent Axios `GET` to remain in sync with MongoDB.
