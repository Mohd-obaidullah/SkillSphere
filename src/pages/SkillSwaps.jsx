import React, { useState, useEffect } from 'react';
import { peersAPI } from '../services/api';
import { Search, UserPlus } from 'lucide-react';

export default function SkillSwaps() {
 const [peers, setPeers] = useState([]);
 const [search, setSearch] = useState('');
 const [loading, setLoading] = useState(true);

 const fetchPeers = async () => {
 setLoading(true);
 try {
 const res = await peersAPI.getPeers(search);
 setPeers(res.data);
 } catch (e) {
 console.error(e);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchPeers();
 }, [search]);

 const handleConnect = async (id) => {
 try {
 await peersAPI.requestConnection(id);
 alert('Connection request sent!');
 } catch (e) {
 alert(e.response?.data?.msg || 'Failed to connect');
 }
 };

 return (
 <div className="animate-[fadeIn_0.35s_ease-out_forwards]">
 <div className="flex items-center justify-between mb-8">
 <div>
 <h2 className="font-heading text-3xl font-extrabold mb-1">Peer Discovery</h2>
 <p className="text-gray-500 text-sm">Find study partners, teammates, and mentors.</p>
 </div>
 </div>

 <div className="relative mb-6 max-w-md">
 <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
 <input 
 type="text" 
 placeholder="Search by name, skills, university..." 
 className="form-control pl-10"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {loading ? <p>Loading peers...</p> : peers.length === 0 ? <p className="text-gray-500">No peers found.</p> : null}
 {peers.map(p => (
 <div key={p._id} className="glass-card flex flex-col justify-between">
 <div>
 <div className="flex items-center gap-3 mb-4">
 <img src={p.avatar || 'https://via.placeholder.com/150'} alt={p.name} className="w-12 h-12 rounded-full border border-gray-200" />
 <div>
 <h3 className="font-bold text-lg leading-tight">{p.name}</h3>
 <p className="text-xs text-gray-500">{p.major} @ {p.university}</p>
 </div>
 </div>
 
 <div className="mb-3">
 <p className="text-sm text-gray-600 line-clamp-2">{p.bio}</p>
 </div>

 <div className="mb-4">
 <span className="text-[10px] text-gray-400 font-bold tracking-wider mb-1 block">SKILLS</span>
 <div className="flex gap-1 flex-wrap">
 {(p.skills || []).slice(0, 4).map((s, idx) => (
 <span key={idx} className="tag text-[10px]">{s.name}</span>
 ))}
 {(p.skills || []).length > 4 && <span className="tag text-[10px]">+{p.skills.length - 4} more</span>}
 </div>
 </div>

 {p.match_score > 0 && (
 <div className="mb-4 p-2 bg-[#C85A32]/10 rounded-lg">
 <div className="flex justify-between items-center mb-1">
 <span className="text-xs font-bold text-[#C85A32]">Match Score</span>
 <span className="text-xs font-bold text-[#C85A32]">{p.match_score}%</span>
 </div>
 <p className="text-[10px] text-gray-600 ">{p.match_reason}</p>
 </div>
 )}
 </div>
 
 <button className="btn-primary w-full flex items-center justify-center gap-2 mt-2" onClick={() => handleConnect(p._id)}>
 <UserPlus size={16} /> Connect
 </button>
 </div>
 ))}
 </div>
 </div>
 );
}
