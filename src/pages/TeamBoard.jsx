import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { projectsAPI } from '../services/api';
import { Plus } from 'lucide-react';

export default function TeamBoard() {
 const { state } = useAppContext();
 const [timerOn, setTimerOn] = useState(false);
 const defaultTimerSettings = { focus: 25, shortBreak: 5, longBreak: 15, sessionsBeforeLong: 4 };
 const userSettings = state.currentUser?.timer_settings || defaultTimerSettings;
 const [timerSettings, setTimerSettings] = useState(userSettings);
 const [timeLeft, setTimeLeft] = useState(userSettings.focus * 60);
 const [timerMode, setTimerMode] = useState('focus'); // focus, shortBreak, longBreak
 const [sessionCount, setSessionCount] = useState(0);
 const [showTimerSettings, setShowTimerSettings] = useState(false);

 const [projects, setProjects] = useState([]);
 const [activeProject, setActiveProject] = useState(null);
 const [tasks, setTasks] = useState([]);
 
 const [showModal, setShowModal] = useState(false);
 const [tTitle, setTTitle] = useState('');
 const [tTag, setTTag] = useState('');

 // Timer logic
 useEffect(() => {
 let interval = null;
 if (timerOn && timeLeft > 0) {
 interval = setInterval(() => setTimeLeft(l => l - 1), 1000);
 } else if (timerOn && timeLeft === 0) {
 if (timerMode === 'focus') {
     const newCount = sessionCount + 1;
     setSessionCount(newCount);
     if (newCount % timerSettings.sessionsBeforeLong === 0) {
         setTimerMode('longBreak');
         setTimeLeft(timerSettings.longBreak * 60);
         window.alert("Long break time!");
     } else {
         setTimerMode('shortBreak');
         setTimeLeft(timerSettings.shortBreak * 60);
         window.alert("Short break time!");
     }
 } else {
     setTimerMode('focus');
     setTimeLeft(timerSettings.focus * 60);
     window.alert("Focus time!");
 }
 }
 return () => clearInterval(interval);
 }, [timerOn, timeLeft, timerMode, sessionCount, timerSettings]);

 const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
 const secs = (timeLeft % 60).toString().padStart(2, '0');

 const myId = state.currentUser._id;

 // Fetch projects I am a member of
 useEffect(() => {
 projectsAPI.getProjects().then(res => {
 const myProjects = res.data.filter(p => p.members.includes(myId));
 setProjects(myProjects);
 if (myProjects.length > 0) setActiveProject(myProjects[0]);
 });
 }, [myId]);

 // Fetch tasks for active project
 useEffect(() => {
 if (!activeProject) return;
 projectsAPI.getTasks(activeProject._id).then(res => {
 setTasks(res.data);
 });
 }, [activeProject]);

 const fetchTasks = async () => {
 if (!activeProject) return;
 const res = await projectsAPI.getTasks(activeProject._id);
 setTasks(res.data);
 };

 const moveTask = async (task) => {
 const map = { "todo": "in-progress", "in-progress": "done", "done": "todo" };
 const nextStatus = map[task.status] || "todo";
 
 // optimistic update
 setTasks(tasks.map(t => t._id === task._id ? { ...t, status: nextStatus } : t));
 
 try {
 await projectsAPI.updateTask(task._id, { status: nextStatus });
 } catch (e) {
 alert("Failed to update task");
 fetchTasks();
 }
 };

 const handleDeleteTask = async (taskId, e) => {
 e.stopPropagation();
 if (!window.confirm("Are you sure you want to delete this task?")) return;
 try {
 await projectsAPI.deleteTask(taskId);
 setTasks(tasks.filter(t => t._id !== taskId));
 } catch (err) {
 alert(err.response?.data?.msg || 'Failed to delete task');
 }
 };

 const handleCreateTask = async (e) => {
 e.preventDefault();
 if (!activeProject) return;
 try {
 await projectsAPI.createTask(activeProject._id, {
 title: tTitle, tag: tTag, status: 'todo'
 });
 setShowModal(false);
 setTTitle(''); setTTag('');
 fetchTasks();
 } catch (e) {
 alert("Failed to create task");
 }
 };

 const cols = { todo: [], 'in-progress': [], done: [] };
 tasks.forEach(t => { if (cols[t.status]) cols[t.status].push(t); });

 return (
 <div className="animate-[fadeIn_0.35s_ease-out_forwards]">
 <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
 <div>
 <h2 className="font-heading text-3xl font-extrabold mb-1">Team Board & Timer</h2>
 <p className="text-gray-500 text-sm">Manage tasks for your projects and stay focused.</p>
 </div>
 
 {projects.length > 0 && (
 <select 
 className="form-control mb-0 w-auto min-w-[200px]"
 value={activeProject ? activeProject._id : ''}
 onChange={e => setActiveProject(projects.find(p => p._id === e.target.value))}
 >
 {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
 </select>
 )}
 </div>

 <div className="glass-card mb-8 text-center max-w-sm mx-auto relative">
 <button 
    onClick={() => setShowTimerSettings(true)}
    className="absolute top-4 right-4 text-gray-400 hover:text-[#C85A32]"
    title="Timer Settings"
 >
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
 </button>
 <h3 className="text-[#C85A32] font-bold mb-2">⏱️ {timerMode === 'focus' ? 'Study Time' : 'Break Time'}</h3>
 <div className="font-heading text-5xl font-extrabold text-[#C85A32] mb-4">{mins}:{secs}</div>
 <div className="flex justify-center gap-2">
 <button className="btn-primary" onClick={() => setTimerOn(true)}>Start</button>
 <button className="btn-secondary" onClick={() => setTimerOn(false)}>Pause</button>
 <button className="btn-secondary" onClick={() => { setTimerOn(false); setTimerMode('focus'); setTimeLeft(timerSettings.focus * 60); setSessionCount(0); }}>Reset</button>
 </div>
 </div>

 {projects.length === 0 ? (
 <div className="text-center py-12 text-gray-500">You are not a member of any projects yet.</div>
 ) : (
 <>
 <div className="flex justify-end mb-4">
 <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => setShowModal(true)}>
 <Plus size={16} /> New Task
 </button>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
 {['todo', 'in-progress', 'done'].map(status => (
 <div key={status} className="bg-white/50 p-4 rounded-xl border border-[rgba(210,200,185,0.5)] h-full">
 <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-gray-500">{status}</h4>
 <div className="flex flex-col gap-3">
 {cols[status].map(t => (
 <div key={t._id} onClick={() => moveTask(t)} className="bg-white p-3 rounded-lg border border-[rgba(210,200,185,0.5)] cursor-pointer shadow-sm hover:border-[#C85A32] relative group">
 <div className="flex justify-between items-start">
    <span className="text-[10px] bg-[#C85A32]/10 text-[#C85A32] px-2 py-0.5 rounded-full font-bold">{t.tag}</span>
    {(activeProject?.owner_id === myId || t.assignee_id === myId) && (
        <button onClick={(e) => handleDeleteTask(t._id, e)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    )}
 </div>
 <h5 className="font-bold text-sm my-2">{t.title}</h5>
 </div>
 ))}
 {cols[status].length === 0 && <p className="text-gray-400 text-xs italic">No tasks</p>}
 </div>
 </div>
 ))}
 </div>
 </>
 )}

 {showModal && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
 <div className="bg-white p-6 rounded-2xl w-full max-w-md">
 <h3 className="font-bold text-xl mb-4">Create Task</h3>
 <form onSubmit={handleCreateTask} className="flex flex-col gap-3">
 <div className="form-group mb-0">
 <label>Task Title</label>
 <input required type="text" className="form-control" value={tTitle} onChange={e=>setTTitle(e.target.value)} />
 </div>
 <div className="form-group mb-0">
 <label>Tag (e.g., frontend, bug)</label>
 <input required type="text" className="form-control" value={tTag} onChange={e=>setTTag(e.target.value)} />
 </div>
 <div className="flex justify-end gap-2 mt-4">
 <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
 <button type="submit" className="btn-primary">Create</button>
 </div>
 </form>
 </div>
 </div>
 )}

 {showTimerSettings && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
 <div className="bg-white p-6 rounded-2xl w-full max-w-md">
 <h3 className="font-bold text-xl mb-4">Timer Settings</h3>
 <form onSubmit={async (e) => {
     e.preventDefault();
     setTimerOn(false);
     setTimerMode('focus');
     setTimeLeft(timerSettings.focus * 60);
     setShowTimerSettings(false);
     try {
         const { profileAPI } = await import('../services/api');
         await profileAPI.updateProfile({ timer_settings: timerSettings });
     } catch (err) {
         console.error('Failed to save settings:', err);
     }
 }} className="flex flex-col gap-3">
 <div className="grid grid-cols-2 gap-4">
 <div className="form-group mb-0">
 <label>Focus (minutes)</label>
 <input type="number" min="1" max="120" required className="form-control" value={timerSettings.focus} onChange={e=>setTimerSettings({...timerSettings, focus: Number(e.target.value)})} />
 </div>
 <div className="form-group mb-0">
 <label>Short Break</label>
 <input type="number" min="1" max="30" required className="form-control" value={timerSettings.shortBreak} onChange={e=>setTimerSettings({...timerSettings, shortBreak: Number(e.target.value)})} />
 </div>
 <div className="form-group mb-0">
 <label>Long Break</label>
 <input type="number" min="1" max="60" required className="form-control" value={timerSettings.longBreak} onChange={e=>setTimerSettings({...timerSettings, longBreak: Number(e.target.value)})} />
 </div>
 <div className="form-group mb-0">
 <label>Sessions until long break</label>
 <input type="number" min="1" max="10" required className="form-control" value={timerSettings.sessionsBeforeLong} onChange={e=>setTimerSettings({...timerSettings, sessionsBeforeLong: Number(e.target.value)})} />
 </div>
 </div>
 <div className="flex justify-end gap-2 mt-4">
 <button type="button" className="btn-secondary" onClick={() => setShowTimerSettings(false)}>Cancel</button>
 <button type="submit" className="btn-primary">Save & Reset</button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
