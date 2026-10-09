import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useSearchParams } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import { Search, Plus, Star } from 'lucide-react';

export default function Projects() {
 const { state, saveState, addNotification } = useAppContext();
 const [activeTab, setActiveTab] = useState('discover');
 const [filter, setFilter] = useState('all');
 const [search, setSearch] = useState('');
 const [projects, setProjects] = useState([]);
 const [loading, setLoading] = useState(true);
 
 const [searchParams, setSearchParams] = useSearchParams();
 // Create Modal state
 const [showModal, setShowModal] = useState(searchParams.get('create') === 'true');
 const [newTitle, setNewTitle] = useState('');
 const [newDesc, setNewDesc] = useState('');
 const [newTags, setNewTags] = useState('');
 const [newRoles, setNewRoles] = useState('');
 
 const [appToReview, setAppToReview] = useState(null);

 useEffect(() => {
     const appId = searchParams.get('app_id');
     const projId = searchParams.get('project_id');
     if (appId && projId) {
         projectsAPI.getProjectApplications(projId).then(res => {
             const app = res.data.find(a => a._id === appId);
             if (app) setAppToReview(app);
         }).catch(console.error);
     }
 }, [searchParams]);

 const handleAcceptApp = async () => {
     try {
         await projectsAPI.acceptApplication(appToReview._id);
         addNotification("Application Accepted", "The student has been added to the team.", "success");
         setAppToReview(null);
         setSearchParams({});
         fetchProjects();
     } catch(e) {
         alert("Failed to accept application");
     }
 };

 const handleRejectApp = async () => {
     try {
         await projectsAPI.rejectApplication(appToReview._id);
         addNotification("Application Rejected", "The student has been rejected.", "info");
         setAppToReview(null);
         setSearchParams({});
     } catch(e) {
         alert("Failed to reject application");
     }
 };

 const fetchProjects = async () => {
 setLoading(true);
 try {
 const res = await projectsAPI.getProjects(search);
 setProjects(res.data);
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchProjects();
 }, [search]); // re-fetch on search change

 let displayedProjects = projects;
 
 if (activeTab === 'my_teams') {
 displayedProjects = displayedProjects.filter(p => p.members.some(m => m._id === state.currentUser._id));
 } else {
 if (filter === 'saved') {
 const saved = state.currentUser.savedProjectIds || [];
 displayedProjects = displayedProjects.filter(p => saved.includes(p._id));
 } else if (filter !== 'all') {
 displayedProjects = displayedProjects.filter(p => p.tags.includes(filter) || (p.requiredRoles && p.requiredRoles.includes(filter)));
 }
 }

 const toggleBookmark = (id) => {
 const user = { ...state.currentUser };
 if (!user.savedProjectIds) user.savedProjectIds = [];
 if (user.savedProjectIds.includes(id)) {
 user.savedProjectIds = user.savedProjectIds.filter(x => x !== id);
 } else {
 user.savedProjectIds.push(id);
 }
 saveState({ ...state, currentUser: user });
 };

 const applyToProject = async (p) => {
 try {
 await projectsAPI.applyProject(p._id);
 addNotification("Application Sent", `You asked to join ${p.title}`, "project");
 window.alert(`Request sent to ${p.owner.name}!`);
 fetchProjects();
 } catch (err) {
 alert(err.response?.data?.msg || 'Failed to apply');
 }
 };

 const handleDeleteProject = async (id) => {
 if (!window.confirm("Are you sure you want to delete this project?")) return;
 try {
 await projectsAPI.deleteProject(id);
 addNotification("Project Deleted", "Project was successfully deleted.", "info");
 fetchProjects();
 } catch (err) {
 alert(err.response?.data?.msg || 'Failed to delete project');
 }
 };

 const handleCreate = async (e) => {
 e.preventDefault();
 try {
 await projectsAPI.createProject({
 title: newTitle,
 description: newDesc,
 tags: newTags.split(',').map(s=>s.trim()).filter(Boolean),
 requiredRoles: newRoles.split(',').map(s=>s.trim()).filter(Boolean)
 });
 setShowModal(false);
 setNewTitle(''); setNewDesc(''); setNewTags(''); setNewRoles('');
 setSearchParams({});
 addNotification("Project Created", "Your project is now live!", "project");
 fetchProjects();
 } catch (err) {
 alert(err.response?.data?.msg || 'Failed to create');
 }
 };

 const myId = state.currentUser._id;
 const savedIds = state.currentUser.savedProjectIds || [];

 return (
 <div className="animate-[fadeIn_0.35s_ease-out_forwards]">
 <div className="flex items-center justify-between mb-8">
 <div>
 <h2 className="font-heading text-3xl font-extrabold mb-1">Project Teams</h2>
 <p className="text-gray-500 text-sm">Browse open student projects and join a team that needs your skills.</p>
 </div>
 <button className="btn-primary" onClick={() => setShowModal(true)}>+ Post a Project</button>
 </div>
 
 <div className="flex gap-4 mb-6 border-b border-[rgba(210,200,185,0.5)]">
 <button className={`pb-2 font-bold ${activeTab === 'discover' ? 'text-[#C85A32] border-b-2 border-[#C85A32]' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('discover')}>Discover Projects</button>
 <button className={`pb-2 font-bold ${activeTab === 'my_teams' ? 'text-[#C85A32] border-b-2 border-[#C85A32]' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('my_teams')}>My Project Teams</button>
 </div>

 {activeTab === 'discover' && (
 <div className="flex gap-3 mb-7 flex-wrap items-center">
 <div className="relative flex-1 min-w-[200px] max-w-[300px]">
 <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
 <input 
 type="text" 
 placeholder="Search projects..." 
 className="form-control pl-9 py-2 m-0"
 value={search}
 onChange={e => setSearch(e.target.value)}
 />
 </div>
 {['all', 'React', 'Python', 'Mobile', 'saved'].map(f => (
 <button 
 key={f}
 onClick={() => setFilter(f)}
 className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${filter === f ? 'bg-[#C85A32]/10 text-[#C85A32] border-[#C85A32]' : 'bg-white/50 border-[rgba(210,200,185,0.5)] text-gray-500'}`}
 >
 {f === 'all' ? 'All Projects' : f === 'saved' ? '⭐ Saved' : f}
 </button>
 ))}
 </div>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {loading ? (
 <div className="col-span-full text-center py-12 text-gray-500">Loading projects...</div>
 ) : displayedProjects.length === 0 ? (
 <div className="col-span-full text-center py-12 text-gray-500">No projects yet. Create your first project.</div>
 ) : (
 displayedProjects.map(p => {
 const isOwner = p.owner_id === myId;
 const isMember = p.members.some(m => m._id === myId);
 const myAppStatus = p.my_application_status;
 const hasApplied = myAppStatus === 'pending' || (p.applicants && p.applicants.includes(myId));
 const isBookmarked = savedIds.includes(p._id);
 return (
 <div key={p._id} className="glass-card flex flex-col justify-between">
 <div>
 <div className="flex justify-between items-start mb-3">
 <span className="tag bg-[#6B46C1]/10 text-[#6B46C1]">{p.status}</span>
 <div className="flex gap-2 items-center">
 {isOwner && (
     <button className="text-red-500 hover:text-red-700 text-xs font-bold mr-2" onClick={() => handleDeleteProject(p._id)} title="Delete Project">Delete</button>
 )}
 <button className="btn-secondary text-xs py-1 px-2" onClick={() => toggleBookmark(p._id)}>{isBookmarked ? '⭐ Saved' : '☆ Save'}</button>
 </div>
 </div>
 <div className="flex justify-between items-center mb-2">
 <h3 className="font-bold text-lg leading-tight">{p.title}</h3>
 </div>
 <p className="text-sm text-gray-500 mb-4">{p.description}</p>
 <div className="mb-3">
 <span className="text-[10px] text-gray-400 font-bold tracking-wider mb-1 block">ROLES NEEDED:</span>
 <div className="flex gap-1 flex-wrap">
 {(p.requiredRoles || []).map(r => <span key={r} className="tag border-[#C85A32] text-[#C85A32] text-[10px]">{r}</span>)}
 </div>
 </div>
 <div className="flex gap-1 flex-wrap mb-4">
 {p.tags.map(t => <span key={t} className="tag text-[10px]">{t}</span>)}
 </div>
 </div>
 
 <div className="flex justify-between items-center mt-2 pt-4 border-t border-[rgba(210,200,185,0.5)] ">
 <div className="flex flex-col gap-2">
 <div className="flex items-center gap-2">
 <img src={p.owner.avatar || 'https://via.placeholder.com/150'} className="w-8 h-8 rounded-full border border-gray-200" alt="" title={p.owner.name} />
 <div>
 <h5 className="text-xs font-bold">{p.owner.name}</h5>
 <span className="text-[10px] text-gray-500">{p.owner.school}</span>
 </div>
 </div>
 {p.members.length > 1 && (
 <div className="flex items-center mt-1">
   <span className="text-[10px] font-bold text-gray-400 mr-2">TEAM:</span>
   <div className="flex -space-x-2">
     {p.members.filter(m => m._id !== p.owner_id).map((m, i) => (
       <img key={i} src={m.avatar || 'https://via.placeholder.com/150'} className="w-6 h-6 rounded-full border border-white" alt="" title={m.name} />
     ))}
   </div>
 </div>
 )}
 </div>
 <div className="flex items-center gap-2">
 {!isOwner && !isMember && !hasApplied && myAppStatus !== 'rejected' && (
 <button className="btn-primary text-xs py-1.5 px-3" onClick={() => applyToProject(p)}>Join Team</button>
 )}
 {!isOwner && !isMember && hasApplied && (
 <span className="text-xs font-semibold text-gray-500">Applied</span>
 )}
 {!isOwner && !isMember && myAppStatus === 'rejected' && (
 <span className="text-xs font-semibold text-red-500">Rejected</span>
 )}
 {isMember && (
 <span className="text-xs font-semibold text-green-500">{isOwner ? 'Owner' : 'Member'}</span>
 )}
 {isMember && (
 <a href={`/team-board?project=${p._id}`} className="btn-secondary text-xs py-1.5 px-3 whitespace-nowrap bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200">Open Workspace</a>
 )}
 </div>
 </div>
 </div>
 )
 })
 )}
 </div>

 {showModal && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
 <div className="bg-white p-6 rounded-2xl w-full max-w-md">
 <h3 className="font-bold text-xl mb-4">Post a Project</h3>
 <form onSubmit={handleCreate} className="flex flex-col gap-3">
 <div className="form-group mb-0">
 <label>Title</label>
 <input required type="text" className="form-control" value={newTitle} onChange={e=>setNewTitle(e.target.value)} />
 </div>
 <div className="form-group mb-0">
 <label>Description</label>
 <textarea required className="form-control" value={newDesc} onChange={e=>setNewDesc(e.target.value)}></textarea>
 </div>
 <div className="form-group mb-0">
 <label>Required Roles (comma separated)</label>
 <input type="text" className="form-control" placeholder="Frontend, UI/UX" value={newRoles} onChange={e=>setNewRoles(e.target.value)} />
 </div>
 <div className="form-group mb-0">
 <label>Tags (comma separated)</label>
 <input type="text" className="form-control" placeholder="React, AI, Health" value={newTags} onChange={e=>setNewTags(e.target.value)} />
 </div>
 <div className="flex justify-end gap-2 mt-4">
 <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setSearchParams({}); }}>Cancel</button>
 <button type="submit" className="btn-primary">Create</button>
 </div>
 </form>
 </div>
 </div>
 )}

 {appToReview && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
 <div className="bg-white p-6 rounded-2xl w-full max-w-lg">
 <h3 className="font-bold text-xl mb-4">Review Application</h3>
 <div className="flex gap-4 items-center mb-6">
 <img src={appToReview.applicant.avatar || 'https://via.placeholder.com/150'} className="w-16 h-16 rounded-full border" alt=""/>
 <div>
 <h4 className="font-bold text-lg">{appToReview.applicant.name}</h4>
 <p className="text-sm text-gray-500">{appToReview.applicant.university || 'University not specified'}</p>
 </div>
 </div>
 
 <div className="mb-4">
 <h5 className="text-xs font-bold text-gray-400 mb-2">BIO</h5>
 <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border">{appToReview.applicant.bio || 'No bio provided.'}</p>
 </div>

 <div className="mb-6">
 <h5 className="text-xs font-bold text-gray-400 mb-2">SKILLS</h5>
 <div className="flex gap-2 flex-wrap">
 {appToReview.applicant.skills?.length > 0 ? (
     appToReview.applicant.skills.map(s => <span key={s.id || s.name} className="tag bg-[#C85A32]/10 text-[#C85A32] text-xs">{s.name}</span>)
 ) : <span className="text-sm text-gray-400">No skills listed</span>}
 </div>
 </div>

 <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
 <button type="button" className="btn-secondary text-gray-500" onClick={() => { setAppToReview(null); setSearchParams({}); }}>Close</button>
 <button type="button" className="btn-secondary text-red-600 border-red-200 hover:bg-red-50" onClick={handleRejectApp}>Reject</button>
 <button type="button" className="btn-primary" onClick={handleAcceptApp}>Accept</button>
 </div>
 </div>
 </div>
 )}

 </div>
 );
}
