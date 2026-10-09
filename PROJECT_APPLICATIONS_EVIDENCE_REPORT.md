# SkillSphere - Project Applications & Evidence Report

## Overview
This report outlines the implementations addressing the Project Applications workflow and the addition of edit/delete actions to Learning Evidence.

## 1. Project Applications Workflow
### Root Cause
Previously, clicking "Apply" simply appended a user's ID string to a generic `applicants` array on the project document. Project owners had no interface to see these applications, review applicant details, or actually accept/reject them to build their team.

### Changes Implemented
- **MongoDB Collection:** Created a new logical collection structure (`project_applications`) inside MongoDB to represent real applications with states (`pending`, `accepted`, `rejected`).
- **Backend API (`backend/routes/projects.py`):**
  - Updated `POST /<proj_id>/apply`: Safely creates a pending application document linking project, owner, and applicant. Also sends a direct persistent notification to the project owner. Prevents duplicate requests.
  - Added `GET /<proj_id>/applications`: Allows project owners to fetch rich application payloads including applicant profile info (avatar, skills, bio, university).
  - Added `POST /applications/<app_id>/accept`: Securely sets application to `accepted`, adds the user to the project's `members` array, and notifies the applicant.
  - Added `POST /applications/<app_id>/reject`: Securely sets application to `rejected`, keeping the user out of the project, and notifies the applicant.
- **Frontend UI (`src/pages/Projects.jsx`):**
  - Connected the applicant’s UI properly to the `my_application_status` derived from the real backend application. 
  - Status accurately transitions to "Applied" or "Rejected", removing the Join Team button contextually.
- **Project Owner UI (`src/pages/TeamBoard.jsx`):**
  - Inserted a robust "Project Applications" review section directly below the task timer.
  - Project owners can now see all pending applications (with applicant's skills and college) and click Accept or Reject.
  - State cleanly removes processed applications from the pending queue.

## 2. Learning Evidence Actions (Edit and Delete)
### Root Cause
Students could add Learning Evidence to their profile but lacked an interface and backend route to update their submissions.

### Changes Implemented
- **Backend API (`backend/routes/evidence.py`):**
  - Added a `PUT /<item_id>` route.
  - Added strict authorization ensuring only the owner can modify their evidence.
  - Protected sensitive statuses (like `verified`). Only `title`, `type`, `reference`, and `skills` can be mutated via this route.
- **Frontend UI (`src/pages/Profile.jsx`):**
  - Refactored the `Add Evidence` modal to act as an `Add or Edit Evidence` modal.
  - Added an `Edit` action button next to the existing `Delete` button on each evidence card.
  - Selecting `Edit` elegantly rehydrates the modal with the user's existing data (Title, URL Reference, and Comma-Separated Skills).
  - Integrates securely with the updated `api.js` endpoints.

## 3. Testing & Verification
- **Frontend Build (`npm run build`)**: Compiled successfully.
- **Backend Tests (`pytest`)**: Verified standard testing suite passes gracefully (which implicitly tests backwards compatibility of the original `applicants` list assertions in `test_workflows.py`).
- **Authorization**:
  - The edit logic securely blocks unauthorized modification attempts across accounts.
  - Project applications strictly scope visibility to the project owner.

## Remaining Limitations
- While "Duplicate Applications" are explicitly prevented, users who are rejected cannot reapply for the same project later. (This behavior is generally considered desirable, but if project owners want to invite rejected members back, a new invite system would be needed).
