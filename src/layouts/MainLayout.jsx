import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { notificationsAPI } from '../services/api';
import { Home, Users, ArrowLeftRight, BookOpen, Calendar, Award, KanbanSquare, User, Settings, Bell, Search, LogOut } from 'lucide-react';

export default function MainLayout() {
 const { state, saveState, logout, addNotification } = useAppContext();
 const navigate = useNavigate();
 const u = state.currentUser;
 const [showNotifs, setShowNotifs] = React.useState(false);
 const [dbNotifications, setDbNotifications] = React.useState([]);

 React.useEffect(() => {
   const fetchNotifs = async () => {
     try {
       const res = await notificationsAPI.getNotifications();
       setDbNotifications(res.data);
     } catch(e) {
       console.error("Failed to fetch notifications");
     }
   };
   fetchNotifs();
   const interval = setInterval(fetchNotifs, 30000);
   return () => clearInterval(interval);
 }, []);

 const notifRef = React.useRef(null);
 React.useEffect(() => {
   const handleClickOutside = (event) => {
     if (notifRef.current && !notifRef.current.contains(event.target)) {
       setShowNotifs(false);
     }
   };
   const handleEscape = (event) => {
     if (event.key === 'Escape') {
       setShowNotifs(false);
     }
   };
   document.addEventListener('mousedown', handleClickOutside);
   document.addEventListener('keydown', handleEscape);
   return () => {
     document.removeEventListener('mousedown', handleClickOutside);
     document.removeEventListener('keydown', handleEscape);
   };
 }, []);

 const markAsRead = async (notifId) => {
   try {
     await notificationsAPI.markAsRead(notifId);
     setDbNotifications(prev => prev.map(n => n._id === notifId ? { ...n, read: true } : n));
   } catch (e) {
     console.error(e);
   }
 };
 
 const markAllAsRead = async () => {
   try {
     await notificationsAPI.markAllAsRead();
     setDbNotifications(prev => prev.map(n => ({ ...n, read: true })));
   } catch(e) {
     console.error(e);
   }
 };

 return (
 <div className="flex min-h-screen">
 {/* Sidebar */}
 <aside className="w-[270px] bg-white/80 backdrop-blur-md border-r border-[rgba(210,200,185,0.5)] p-6 flex flex-col fixed h-screen z-50">
 <div className="flex items-center gap-3 pb-6 border-b border-[rgba(210,200,185,0.5)] mb-6">
 <div className="w-10 h-10 bg-gradient-to-br from-[#C85A32] to-[#6B46C1] rounded-xl flex items-center justify-center shadow-lg">
 <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-6 h-6"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
 </div>
 <div>
 <h1 className="font-heading text-xl font-extrabold bg-gradient-to-br from-[#C85A32] to-[#6B46C1] text-transparent bg-clip-text leading-tight">SKILLSPHERE</h1>
 <span className="text-[0.7rem] text-gray-500 uppercase font-semibold tracking-wider">Student Network</span>
 </div>
 </div>

 <nav className="flex flex-col gap-2 flex-1">
 <NavItem to="/" icon={<Home size={20} />} label="Home" />
 <NavItem to="/projects" icon={<Users size={20} />} label="Find Teammates" badge={state.projects?.length} />
 <NavItem to="/skill-swaps" icon={<ArrowLeftRight size={20} />} label="Skill Swap" />
 <NavItem to="/resources" icon={<BookOpen size={20} />} label="Study Notes" />
 <NavItem to="/events" icon={<Calendar size={20} />} label="Events" />
 <NavItem to="/quizzes" icon={<Award size={20} />} label="Skill Tests" />
 <NavItem to="/workspace" icon={<KanbanSquare size={20} />} label="Team Board" />
 <NavItem to="/profile" icon={<User size={20} />} label="My Profile" />
 <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
 </nav>

 <div className="mt-auto bg-white/50 border border-[rgba(210,200,185,0.5)] p-3 rounded-xl flex items-center gap-3 cursor-pointer shadow-sm hover:border-[#C85A32] transition-colors">
 <img src={u.avatar} alt="User" className="w-10 h-10 rounded-full object-cover border-2 border-[#C85A32]" />
 <div>
 <h4 className="text-sm font-semibold">{u.name}</h4>
 <p className="text-xs text-[#C85A32] font-semibold">Lvl {u.level} • {u.levelTitle}</p>
 </div>
 </div>
 </aside>

 {/* Main Content */}
 <main className="ml-[270px] flex-1 flex flex-col min-w-0">
 <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-[rgba(210,200,185,0.5)] flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
 <div className="relative w-[380px]">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
 <input type="text" placeholder="Search projects, skills, or notes..." className="w-full bg-[#F7F4EE] border border-[rgba(210,200,185,0.5)] rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-[#C85A32] transition-colors" />
 </div>

 <div className="flex items-center gap-4">
 <div className="relative" ref={notifRef}>
 <button 
   className="relative w-10 h-10 rounded-full bg-white border border-[rgba(210,200,185,0.5)] flex items-center justify-center hover:border-[#C85A32] transition-colors"
   onClick={() => setShowNotifs(!showNotifs)}
 >
 <Bell size={18} className="text-gray-500 hover:text-[#C85A32]" />
 {dbNotifications?.filter(n => !n.read).length > 0 && (
 <span className="absolute top-1 right-1 w-4 h-4 bg-pink-600 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(159,18,57,0.8)]">
 {dbNotifications.filter(n => !n.read).length}
 </span>
 )}
 </button>
 
 {showNotifs && (
   <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[rgba(210,200,185,0.5)] z-50 overflow-hidden">
     <div className="flex justify-between items-center p-3 border-b border-[rgba(210,200,185,0.5)] bg-gray-50">
       <span className="font-bold text-sm">Notifications</span>
       <button className="text-xs text-[#C85A32] hover:underline" onClick={markAllAsRead}>Mark all read</button>
     </div>
     <div className="max-h-[300px] overflow-y-auto">
       {dbNotifications?.length === 0 ? (
         <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
       ) : (
         dbNotifications?.map(n => (
           <div key={n._id} className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-[#C85A32]/5' : ''}`} onClick={() => markAsRead(n._id)}>
             <div className="flex justify-between items-start mb-1">
               <span className="font-semibold text-sm leading-tight">{n.title}</span>
               {!n.read && <div className="w-2 h-2 rounded-full bg-[#C85A32] mt-1 shrink-0" />}
             </div>
             <p className="text-xs text-gray-600 mb-1">{n.message}</p>
             <span className="text-[10px] text-gray-400">{n.timestamp || 'Just now'}</span>
           </div>
         ))
       )}
     </div>
   </div>
 )}
 </div>
 <button className="btn-primary" onClick={() => navigate('/projects?create=true')}>
 <span>Post Project</span>
 </button>
 <button onClick={logout} className="btn-secondary py-1.5 px-3 text-sm" title="Log Out">
 🚪 Log Out
 </button>
 </div>
 </header>

 <div className="p-8 flex-1">
 <Outlet />
 </div>
 </main>
 </div>
 );
}

function NavItem({ to, icon, label, badge }) {
 return (
 <NavLink to={to} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'text-[#C85A32] bg-[#C85A32]/10 border border-[#C85A32]/25 font-semibold' : 'text-gray-500 hover:text-gray-800 hover:bg-[#C85A32]/5 hover:translate-x-1'}`}>
 {icon}
 <span>{label}</span>
 {badge !== undefined && (
 <span className="ml-auto bg-gradient-to-br from-[#C85A32] to-[#6B46C1] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>
 )}
 </NavLink>
 );
}
