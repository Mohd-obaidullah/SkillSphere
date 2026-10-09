# SkillSphere - Bugfix & Stabilization Report

This report documents the fixes, improvements, and feature completions executed during Phase 5 (Final QA, Security, UI Polish & Deployment) of the SkillSphere project.

## 1. Syntax & Build Failures (Blank Screen on Login)
* **Root Cause**: During the process of stripping out Tailwind CSS `dark:` classes via a Python regex script, valid state array destructuring structures in React files (e.g. `const [state, setState] = useState()`) were unintentionally mangled to include a comma but no closing bracket, or stripped closing brackets entirely (e.g. `const [state,] setState =`). Object array declarations were similarly broken (e.g., `[]` changed to `[ `). This led to Vite build failures and React runtime crashes. Additionally, a `useState` import was missing in `Dashboard.jsx`.
* **Files Changed**: 
  * `src/context/AppContext.jsx`
  * `src/layouts/MainLayout.jsx`
  * `src/pages/Dashboard.jsx`
  * `src/pages/TeamBoard.jsx`
  * `src/pages/StudyNotes.jsx`
  * `src/pages/Projects.jsx`
  * `src/pages/Profile.jsx`
  * `src/pages/SkillSwaps.jsx`
  * `src/data/demoData.js`
* **Features Fixed**: Application rendering is completely restored. Vite builds successfully without syntax warnings.
* **Test Results**: Passed. Executing `npm run build` returned code 0 and successful chunk generation.

## 2. Skill Tests & Badges (Not Working)
* **Root Cause**: The Quiz UI featured a placeholder "Simulate Pass" button that lacked any true interactivity or connectivity to the user profile state. Furthermore, the backend had no endpoint to securely award a badge and allocate XP upon test completion.
* **Files Changed**:
  * `src/pages/Quizzes.jsx`
  * `src/services/api.js`
  * `backend/routes/profile.py`
* **Features Fixed**: 
  * Added `POST /api/profile/badges` to record earned badges and award XP in MongoDB.
  * Rebuilt the `Quizzes.jsx` UI to fully implement an interactive testing mode: users can select answers, track their score, and are awarded a badge only if they exceed an 80% passing threshold.
* **Test Results**: Passed. Badges are properly reflected in the user's `verifiedBadges` array.

## 3. Notifications System
* **Root Cause**: Notifications were previously referenced dynamically inside `AppContext` state but lacked a UI pop-over to view them and mark them as read.
* **Files Changed**: 
  * `src/layouts/MainLayout.jsx`
* **Features Fixed**: 
  * Implemented an interactive notification dropdown in the top header tied to a Bell icon.
  * Clicking individual notifications dismisses/marks them as read (persisted locally in AppContext state).
* **Test Results**: Passed. Notification counts correctly reflect the unread filter.

## 4. Header 'Post Project' Button Link
* **Root Cause**: The "Post Project" button in the primary layout header was hooked up to a `window.alert` stub.
* **Files Changed**: 
  * `src/layouts/MainLayout.jsx`
  * `src/pages/Projects.jsx`
* **Features Fixed**: 
  * Linked the global header button to navigate to `/projects?create=true`.
  * Added `useSearchParams` hook listener in `Projects.jsx` that automatically forces the "Create Project" modal open upon arrival.
* **Test Results**: Passed. Seamless navigation from anywhere in the app to the project creation modal.

## 5. Resource Upload (Study Rooms)
* **Root Cause**: File uploads were sending documents to the Backblaze B2 bucket via the generic `/api/storage/upload/document` endpoint but failing to relate those uploads to the specific Study Room ID in the MongoDB file document. 
* **Files Changed**: 
  * `backend/routes/storage.py`
  * `src/services/api.js`
  * `src/pages/StudyNotes.jsx`
* **Features Fixed**: 
  * Modified the backend storage endpoint to accept an optional `room_id` in the form payload.
  * Updated frontend `storageAPI.uploadDocument` to pass the `activeRoom._id`.
  * Uploaded documents are now bound to the Study Room and viewable to all members.
* **Test Results**: Passed.

## 6. Events Page
* **Root Cause**: The Events page consisted entirely of a one-line placeholder (`<div>Events Page</div>`), and the backend lacked any infrastructure to support events.
* **Files Changed**: 
  * `backend/routes/events.py` (New)
  * `backend/app.py`
  * `src/services/api.js`
  * `src/pages/Events.jsx`
* **Features Fixed**: 
  * Established the complete `GET /api/events`, `POST /api/events`, and `POST /api/events/<id>/register` API routes in Flask.
  * Designed and built the React component displaying upcoming events, allowing event creation, and managing RSVPs.
* **Test Results**: Passed.

## 7. Settings Page
* **Root Cause**: The Settings page was a minimal placeholder template.
* **Files Changed**: 
  * `src/pages/Settings.jsx`
* **Features Fixed**: 
  * Overhauled the page into a comprehensive Profile Settings form interface.
  * Tied editable inputs (Name, University, Major, Bio, Avatar) to the active `profileAPI.updateProfile` endpoint.
  * Linked Avatar uploads directly to the Cloudinary image uploader.
  * Centralized the Log Out action.
* **Test Results**: Passed. Profile updates correctly cascade to MongoDB and update the global React Context state in real-time.

---

### Remaining Limitations
1. **Notification Persistence**: While notifications are accurately generated dynamically throughout the user session and can be read/dismissed, they currently live purely in the React Application Context (`AppContext.jsx`). They are not yet persisted to a dedicated MongoDB schema collection (meaning they reset on hard refresh).
2. **Email Changes**: The Settings page disables the "Email Address" field as updating emails typically requires a complex verification loop not yet supported by the Auth blueprint.
3. **Password Resets**: No user-facing flows exist for forgotten passwords or changing a password.
