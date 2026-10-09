import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import AuthScreen from './pages/AuthScreen';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import SkillSwaps from './pages/SkillSwaps';
import StudyNotes from './pages/StudyNotes';
import Events from './pages/Events';
import Quizzes from './pages/Quizzes';
import TeamBoard from './pages/TeamBoard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

export default function App() {
 const { userId } = useAppContext();

 return (
 <Router>
 <Routes>
 {!userId ? (
 <Route path="*" element={<AuthScreen />} />
 ) : (
 <Route element={<MainLayout />}>
 <Route path="/" element={<Dashboard />} />
 <Route path="/projects" element={<Projects />} />
 <Route path="/skill-swaps" element={<SkillSwaps />} />
 <Route path="/resources" element={<StudyNotes />} />
 <Route path="/events" element={<Events />} />
 <Route path="/quizzes" element={<Quizzes />} />
 <Route path="/team-board" element={<TeamBoard />} />
 <Route path="/profile" element={<Profile />} />
 <Route path="/settings" element={<Settings />} />
 <Route path="*" element={<Navigate to="/" replace />} />
 </Route>
 )}
 </Routes>
 </Router>
 );
}
