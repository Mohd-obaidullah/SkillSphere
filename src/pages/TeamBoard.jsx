import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { projectsAPI, roomsAPI } from '../services/api';
import { Plus, Users, MessageSquare } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function TeamBoard() {
 const { state } = useAppContext();
 const [searchParams] = useSearchParams();
 const navigate = useNavigate();



 const [projects, setProjects] = useState([]);
 const [activeProject, setActiveProject] = useState(null);
 const [tasks, setTasks] = useState([]);
 const [applications, setApplications] = useState([]);
 const [activeTab, setActiveTab] = useState('board'); // overview, board, discussion
 const [questions, setQuestions] = useState([]);
 const [newQuestion, setNewQuestion] = useState('');
 
 const [showModal, setShowModal] = useState(false);
 const [tTitle, setTTitle] = useState('');
 const [tTag, setTTag] = useState('');
 const [progressNotes, setProgressNotes] = useState('');
 const [projectStatus, setProjectStatus] = useState('');



 const myId = state.currentUser._id;

 // Fetch projects I am a member of
 useEffect(() => {
 projectsAPI.getProjects().then(res => {
 const myProjects = res.data.filter(p => p.members.some(m => m._id === myId));
 setProjects(myProjects);
 const urlProject = searchParams.get('project');
 if (urlProject) {
     const found = myProjects.find(p => p._id === urlProject);
     if (found) {
         setActiveProject(found);
         setProjectStatus(found.status || '');
         setProgressNotes(found.progress_notes || '');
     } else if (myProjects.length > 0) {
         setActiveProject(myProjects[0]);
         setProjectStatus(myProjects[0].status || '');
         setProgressNotes(myProjects[0].progress_notes || '');
     }
 } else if (myProjects.length > 0) {
     setActiveProject(myProjects[0]);
     setProjectStatus(myProjects[0].status || '');
     setProgressNotes(myProjects[0].progress_notes || '');
 }
 });
 }, [myId, searchParams]);

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

 const fetchApplications = async () => {
 if (!activeProject || activeProject.owner_id !== myId) {
     setApplications([]);
     return;
 }
 try {
     const res = await projectsAPI.getProjectApplications(activeProject._id);
     setApplications(res.data);
 } catch (e) {
     console.error(e);
 }
 };

 useEffect(() => {
 fetchApplications();
 }, [activeProject, myId]);

 const handleAcceptApp = async (appId) => {
 try {
     await projectsAPI.acceptApplication(appId);
     fetchApplications();
 } catch(e) { alert("Failed to accept"); }
 };
 
 const handleRejectApp = async (appId) => {
 try {
     await projectsAPI.rejectApplication(appId);
     fetchApplications();
 } catch(e) { alert("Failed to reject"); }
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

 const handleUpdateProgress = async (e) => {
 e.preventDefault();
 if (!activeProject) return;
 try {
     await projectsAPI.updateProject(activeProject._id, {
         status: projectStatus,
         progress_notes: progressNotes
     });
     alert("Project progress updated successfully!");
 } catch (err) {
     alert("Failed to update progress.");
 }
 };

 const fetchRoomQuestions = async () => {
 if (activeProject?.room_id) {
     try {
         const res = await roomsAPI.getQuestions(activeProject.room_id);
         setQuestions(res.data);
     } catch (e) {
         console.error(e);
     }
 }
 };

 useEffect(() => {
 if (activeTab === 'discussion') {
     fetchRoomQuestions();
 }
 }, [activeTab, activeProject]);

 const handleAsk = async (e) => {
 e.preventDefault();
 if (!newQuestion.trim() || !activeProject?.room_id) return;
 try {
 await roomsAPI.createQuestion(activeProject.room_id, { title: newQuestion });
 setNewQuestion('');
 fetchRoomQuestions();
 } catch (err) {
 alert("Failed to post question");
 }
 };

 const cols = { todo: [], 'in-progress': [], done: [] };
 tasks.forEach(t => { if (cols[t.status]) cols[t.status].push(t); });

 return (
 <div className="animate-[fadeIn_0.35s_ease-out_forwards]">
 <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
 <div>
 <h2 className="font-heading text-3xl font-extrabold mb-1">Project Workspace</h2>
 <p className="text-gray-500 text-sm">Manage tasks for your projects and stay focused.</p>
 </div>
 
 <div className="flex gap-4 items-center">
 {projects.length > 0 && (
 <select 
 className="form-control mb-0 w-auto min-w-[200px]"
 value={activeProject ? activeProject._id : ''}
 onChange={e => {
    setActiveProject(projects.find(p => p._id === e.target.value));
    navigate(`/team-board?project=${e.target.value}`);
 }}
 >
 {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
 </select>
 )}
 </div>
 </div>

 {activeProject && (
 <div className="flex gap-4 mb-6 border-b border-[rgba(210,200,185,0.5)] pb-2">
    <button onClick={() => setActiveTab('overview')} className={`text-sm font-bold ${activeTab === 'overview' ? 'text-[#C85A32] border-b-2 border-[#C85A32]' : 'text-gray-500 hover:text-gray-700'}`}>Overview & Progress</button>
    <button onClick={() => setActiveTab('board')} className={`text-sm font-bold ${activeTab === 'board' ? 'text-[#C85A32] border-b-2 border-[#C85A32]' : 'text-gray-500 hover:text-gray-700'}`}>Task Board</button>
    <button onClick={() => setActiveTab('discussion')} className={`text-sm font-bold flex items-center gap-1 ${activeTab === 'discussion' ? 'text-[#C85A32] border-b-2 border-[#C85A32]' : 'text-gray-500 hover:text-gray-700'}`} disabled={!activeProject.room_id} title={!activeProject.room_id ? 'Room unlocks when a member joins' : ''}>
        Discussion
        {!activeProject.room_id && <span className="text-[10px] bg-gray-200 text-gray-500 px-1 rounded-full ml-1">Locked</span>}
    </button>
 </div>
 )}


 {projects.length === 0 ? (
 <div className="text-center py-12 text-gray-500">You are not a member of any projects yet.</div>
 ) : (
 <>
 {activeTab === 'overview' && activeProject && (
    <div className="glass-card mb-8">
        <h3 className="font-bold text-xl mb-4">{activeProject.title}</h3>
        <p className="text-gray-600 mb-6 whitespace-pre-wrap">{activeProject.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-6">
            <div>
                <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-4">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                    {(activeProject.requiredRoles || []).map(r => <span key={r} className="tag border-[#C85A32] text-[#C85A32] text-xs">{r}</span>)}
                    {(activeProject.tags || []).map(t => <span key={t} className="tag text-xs">{t}</span>)}
                </div>
            </div>
            <div>
                <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-4">Team Members</h4>
                <div className="flex flex-col gap-3">
                    {activeProject.members.map(m => (
                        <div key={m._id} className="flex items-center gap-3">
                            <img src={m.avatar || 'https://via.placeholder.com/150'} className="w-8 h-8 rounded-full border border-gray-200" alt={m.name} />
                            <div>
                                <h5 className="font-bold text-sm leading-tight">{m.name}</h5>
                                {m._id === activeProject.owner_id && <span className="text-[10px] text-[#C85A32] font-bold">Project Owner</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-[rgba(210,200,185,0.5)]">
            <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-4">Project Progress</h4>
            <form onSubmit={handleUpdateProgress} className="flex flex-col gap-4 max-w-2xl">
                <div>
                    <label className="block text-xs font-bold mb-1">Status</label>
                    <select className="form-control mb-0 w-full md:w-1/2" value={projectStatus} onChange={e => setProjectStatus(e.target.value)}>
                        <option value="Actively Recruiting">Actively Recruiting</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Testing">Testing</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold mb-1">Progress Notes</label>
                    <textarea 
                        className="form-control mb-0 w-full" 
                        rows="3" 
                        placeholder="What's the latest update on this project?"
                        value={progressNotes}
                        onChange={e => setProgressNotes(e.target.value)}
                    ></textarea>
                </div>
                <div>
                    <button type="submit" className="btn-primary">Save Progress</button>
                </div>
            </form>
        </div>
    </div>
 )}
 
 {activeTab === 'board' && (
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

 {activeTab === 'discussion' && activeProject?.room_id && (
    <div className="glass-card mb-8">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MessageSquare size={18} /> Team Discussion</h3>
        <form onSubmit={handleAsk} className="flex gap-2 mb-6">
            <input type="text" className="form-control mb-0" placeholder="Post a message to the team..." value={newQuestion} onChange={e=>setNewQuestion(e.target.value)} />
            <button type="submit" className="btn-primary whitespace-nowrap">Send</button>
        </form>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {questions.length === 0 ? <p className="text-gray-500 text-sm">No discussions yet. Say hi to your team!</p> : null}
            {questions.map(q => (
                <div key={q._id} className="p-4 border rounded-xl bg-white/70 border-[rgba(210,200,185,0.5)] shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <img src={q.author?.avatar || 'https://via.placeholder.com/150'} className="w-6 h-6 rounded-full border border-gray-200" alt="" />
                        <span className="font-bold text-sm">{q.author?.name || 'Unknown'}</span>
                    </div>
                    <h4 className="font-bold text-md mb-1">{q.title}</h4>
                    {q.content && <p className="text-sm text-gray-700 whitespace-pre-wrap">{q.content}</p>}
                </div>
            ))}
        </div>
    </div>
 )}
 {activeProject?.owner_id === myId && applications.length > 0 && (
  <div className="mt-8 mb-8">
  <h3 className="font-heading text-2xl font-bold mb-4">Project Applications</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {applications.map(app => (
  <div key={app._id} className="glass-card flex flex-col justify-between p-4">
  <div className="flex items-start gap-4 mb-4">
  <img src={app.applicant.avatar || 'https://via.placeholder.com/150'} alt="" className="w-12 h-12 rounded-full" />
  <div>
  <h4 className="font-bold text-lg leading-tight">{app.applicant.name}</h4>
  <p className="text-xs text-gray-500 mb-1">{app.applicant.university}</p>
  <div className="flex flex-wrap gap-1">
  {(app.applicant.skills || []).map((s,i) => <span key={i} className="tag text-[10px]">{s.name}</span>)}
  </div>
  </div>
  </div>
  <div className="flex justify-between items-center mt-2 border-t pt-3">
  <span className={`text-xs font-bold ${app.status === 'pending' ? 'text-orange-500' : app.status === 'accepted' ? 'text-green-500' : 'text-red-500'}`}>
  STATUS: {app.status.toUpperCase()}
  </span>
  {app.status === 'pending' && (
  <div className="flex gap-2">
  <button className="btn-secondary text-xs py-1 px-3 border-red-500 text-red-500 hover:bg-red-50" onClick={() => handleRejectApp(app._id)}>Reject</button>
  <button className="btn-primary text-xs py-1 px-3" onClick={() => handleAcceptApp(app._id)}>Accept</button>
  </div>
  )}
  </div>
  </div>
  ))}
  </div>
  </div>
 )}
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
