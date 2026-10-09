import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
 const { state } = useAppContext();
 const u = state.currentUser;
 const navigate = useNavigate();
 const canvasRef = useRef(null);

 useEffect(() => {
 // Simple skill radar chart
 const canvas = canvasRef.current;
 if (!canvas) return;
 const ctx = canvas.getContext('2d');
 const w = canvas.width, h = canvas.height;
 const cx = w / 2, cy = h / 2, radius = 100;
 ctx.clearRect(0, 0, w, h);
 
 const skills = u.skills.slice(0, 5);
 const isDarkTheme = document.body.classList.contains('theme-dark');
 
 if (skills.length < 3) {
 ctx.fillStyle = isDarkTheme ? "#6B7280" : "#9CA3AF";
 ctx.font = "13px sans-serif";
 ctx.textAlign = "center";
 ctx.fillText("Add at least 3 skills to see chart", cx, cy);
 return;
 }

 const numSkills = skills.length;
 const angleStep = (Math.PI * 2) / numSkills;
 const gridColor = isDarkTheme ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
 const labelColor = isDarkTheme ? "#9CA3AF" : "#4B5563";
 const strokeColor = isDarkTheme ? "#06B6D4" : "#C85A32";
 const fillColor = isDarkTheme ? "rgba(6,182,212,0.25)" : "rgba(200,90,50,0.2)";

 for (let lvl = 1; lvl <= 4; lvl++) {
 const r = (radius / 4) * lvl;
 ctx.beginPath();
 for (let i = 0; i < numSkills; i++) {
 const angle = i * angleStep - Math.PI / 2;
 const x = cx + r * Math.cos(angle), y = cy + r * Math.sin(angle);
 i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
 }
 ctx.closePath(); ctx.strokeStyle = gridColor; ctx.lineWidth = 1; ctx.stroke();
 }

 ctx.font = "11px sans-serif";
 ctx.fillStyle = labelColor; ctx.textAlign = "center"; ctx.textBaseline = "middle";
 for (let i = 0; i < numSkills; i++) {
 const angle = i * angleStep - Math.PI / 2;
 const x = cx + radius * Math.cos(angle), y = cy + radius * Math.sin(angle);
 ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y);
 ctx.strokeStyle = gridColor; ctx.stroke();
 ctx.fillText(skills[i].name.split(" ")[0], cx + (radius + 22) * Math.cos(angle), cy + (radius + 22) * Math.sin(angle));
 }

 ctx.beginPath();
 for (let i = 0; i < numSkills; i++) {
 const angle = i * angleStep - Math.PI / 2;
 const r = radius * (skills[i].level / 100);
 const x = cx + r * Math.cos(angle), y = cy + r * Math.sin(angle);
 i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
 }
 ctx.closePath(); ctx.fillStyle = fillColor; ctx.fill();
 ctx.strokeStyle = strokeColor; ctx.lineWidth = 2; ctx.stroke();
 }, [u.skills, state]);

 const [topProject, setTopProject] = useState(null);
 const [topSwap, setTopSwap] = useState(null);

 useEffect(() => {
 // Fetch a real project and peer
 import('../services/api').then(({ projectsAPI, peersAPI }) => {
 projectsAPI.getProjects().then(res => {
 if (res.data.length > 0) setTopProject(res.data[0]);
 });
 peersAPI.getPeers().then(res => {
 if (res.data.length > 0) setTopSwap(res.data[0]);
 });
 });
 }, []);

 return (
 <div className="animate-[fadeIn_0.35s_ease-out_forwards]">
 <div className="bg-gradient-to-br from-[#C85A32]/10 to-[#6B46C1]/10 border border-[#C85A32]/30 rounded-2xl p-8 mb-8 flex items-center justify-between relative overflow-hidden">
 <div className="relative z-10">
 <h2 className="font-heading text-3xl font-extrabold mb-2">Welcome back, {u.name.split(' ')[0]}! 👋</h2>
 <p className="text-gray-500 max-w-xl text-base mb-5">You have <strong>3 team join requests</strong> and your React skills match well with active projects.</p>
 <div className="flex gap-4 flex-wrap">
 <button className="btn-primary" onClick={() => navigate('/projects')}>Find a Project</button>
 <button className="btn-secondary" onClick={() => navigate('/quizzes')}>Take a Skill Test</button>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-7">
 <div className="flex flex-col gap-6">
 <div className="glass-card">
 <div className="flex items-center justify-between mb-5">
 <h3 className="text-lg font-bold">My Skills</h3>
 <button className="btn-secondary text-xs py-1.5 px-3" onClick={() => navigate('/profile')}>+ Add Skill</button>
 </div>
 {(!u.skills || u.skills.length === 0) ? (
 <p className="text-gray-400 text-sm">You haven't added any skills yet.</p>
 ) : (
 <div className="flex flex-col gap-4">
 {u.skills.map(s => (
 <div key={s.name} className="flex flex-col gap-1.5">
 <div className="flex justify-between text-sm font-semibold">
 <div className="flex items-center gap-2">
 <span>{s.name}</span>
 {s.verified && <svg className="w-4 h-4 text-[#C85A32]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
 </div>
 <span>{s.level}%</span>
 </div>
 <div className="h-2 bg-black/5 rounded-full overflow-hidden">
 <div className="h-full bg-gradient-to-r from-[#C85A32] to-[#6B46C1] rounded-full transition-all duration-1000" style={{width: `${s.level}%`}}></div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 <div className="glass-card">
 <h3 className="text-lg font-bold mb-4">Good Matches for You</h3>
 <div className="flex flex-col gap-4">
 {topProject && (
 <div className="bg-white p-4 rounded-xl border border-[rgba(210,200,185,0.5)] ">
 <div className="flex justify-between items-center mb-1">
 <span className="tag text-[#C85A32] bg-[#C85A32]/10 ">Top Project Match</span>
 <span className="text-xs text-gray-500">{topProject.owner.school}</span>
 </div>
 <h5 className="font-bold text-[0.95rem]">{topProject.title}</h5>
 <p className="text-[0.82rem] text-gray-500 my-1">Needs: {topProject.requiredRoles.join(", ")}</p>
 <div className="flex gap-2 mt-2">
 <button className="btn-primary text-xs py-1.5 px-3" onClick={() => navigate('/projects')}>View Projects</button>
 </div>
 </div>
 )}
 {topSwap && (
 <div className="bg-white p-4 rounded-xl border border-[rgba(210,200,185,0.5)] ">
 <div className="flex justify-between items-center mb-1">
 <span className="tag text-[#6B46C1] bg-[#6B46C1]/10 ">Peer Recommendation</span>
 <span className="text-xs text-gray-500">{topSwap.university}</span>
 </div>
 <h5 className="font-bold text-[0.95rem]">{topSwap.name}</h5>
 <p className="text-[0.82rem] text-gray-500 my-1">{topSwap.match_reason}</p>
 <div className="flex gap-2 mt-2">
 <button className="btn-secondary text-xs py-1.5 px-3" onClick={() => navigate('/skill-swaps')}>Connect</button>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>

 <div className="flex flex-col gap-6">
 <div className="glass-card">
 <div className="grid grid-cols-2 gap-4">
 <StatCard value={u.stats.projectsCompleted} label="Projects Done" />
 <StatCard value={u.stats.skillSwaps} label="Skill Swaps" />
 <StatCard value={u.stats.endorsements} label="Good Reviews" />
 <StatCard value={u.xp.toLocaleString()} label="Points Earned" />
 </div>
 </div>

 <div className="glass-card flex flex-col items-center">
 <h4 className="self-start font-bold mb-2">Skill Balance Chart</h4>
 <canvas ref={canvasRef} width="280" height="280" className="max-w-full h-auto"></canvas>
 </div>
 </div>
 </div>
 </div>
 );
}

function StatCard({ value, label }) {
 return (
 <div className="bg-white border border-[rgba(210,200,185,0.5)] rounded-xl p-4 text-center shadow-sm">
 <div className="font-heading text-2xl font-extrabold text-[#C85A32]">{value}</div>
 <div className="text-[0.78rem] text-gray-500 font-medium">{label}</div>
 </div>
 );
}
