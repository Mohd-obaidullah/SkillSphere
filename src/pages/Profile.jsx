import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { profileAPI, evidenceAPI } from '../services/api';
import { Trash2, Link as LinkIcon, Plus } from 'lucide-react';

export default function Profile() {
 const { state } = useAppContext();
 const [evidence, setEvidence] = useState([]);
 const [loading, setLoading] = useState(true);
 
 const [showModal, setShowModal] = useState(false);
 const [eTitle, setETitle] = useState('');
 const [eRef, setERef] = useState('');
 const [eSkills, setESkills] = useState('');

 const fetchEvidence = async () => {
 try {
 const res = await evidenceAPI.getEvidence();
 setEvidence(res.data);
 } catch (e) {
 console.error(e);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchEvidence();
 }, []);

 const handleAddEvidence = async (e) => {
 e.preventDefault();
 try {
 await evidenceAPI.addEvidence({
 title: eTitle,
 reference: eRef,
 skills: eSkills.split(',').map(s=>s.trim()).filter(Boolean)
 });
 setShowModal(false);
 setETitle(''); setERef(''); setESkills('');
 fetchEvidence();
 } catch (err) {
 alert("Failed to add evidence");
 }
 };

 const handleDelete = async (id) => {
 try {
 await evidenceAPI.deleteEvidence(id);
 fetchEvidence();
 } catch (e) {
 alert("Failed to delete");
 }
 };

 const user = state.currentUser;
 if (!user) return <div>Loading...</div>;

 return (
 <div className="animate-[fadeIn_0.35s_ease-out_forwards] max-w-4xl mx-auto">
 <div className="flex items-center justify-between mb-8">
 <div>
 <h2 className="font-heading text-3xl font-extrabold mb-1">My Profile</h2>
 <p className="text-gray-500 text-sm">Manage your public information and learning evidence.</p>
 </div>
 </div>

 <div className="glass-card mb-8 flex gap-6 items-start">
 <img src={user.avatar || 'https://via.placeholder.com/150'} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white shadow-lg" />
 <div className="flex-1">
 <h3 className="text-2xl font-bold">{user.name}</h3>
 <p className="text-[#C85A32] font-semibold mb-2">{user.major} @ {user.university}</p>
 <p className="text-gray-600 mb-4">{user.bio}</p>
 
 <h4 className="text-sm font-bold text-gray-400 mb-2">MY SKILLS</h4>
 <div className="flex flex-wrap gap-2">
 {(user.skills || []).map((s, i) => (
 <span key={i} className="tag text-xs bg-[#C85A32]/10 text-[#C85A32]">{s.name} ({s.level}%)</span>
 ))}
 </div>
 </div>
 </div>

 <div className="flex items-center justify-between mb-4">
 <h3 className="font-heading text-2xl font-bold">Learning Evidence</h3>
 <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => setShowModal(true)}>
 <Plus size={16} /> Add Evidence
 </button>
 </div>

 <div className="grid gap-4">
 {loading ? <p>Loading evidence...</p> : evidence.length === 0 ? <p className="text-gray-500">No evidence attached yet.</p> : null}
 {evidence.map(e => (
 <div key={e._id} className="glass-card flex justify-between items-center p-4">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="tag text-[10px] bg-green-100 text-green-700">{e.status}</span>
 <h4 className="font-bold text-lg">{e.title}</h4>
 </div>
 {e.reference && (
 <a href={e.reference} target="_blank" rel="noreferrer" className="text-blue-500 text-sm flex items-center gap-1 mb-2 hover:underline">
 <LinkIcon size={14} /> View Reference
 </a>
 )}
 <div className="flex gap-1">
 {e.skills.map(s => <span key={s} className="tag text-[10px] bg-gray-100 text-gray-600">{s}</span>)}
 </div>
 </div>
 <button className="text-red-500 p-2 hover:bg-red-50 rounded" onClick={() => handleDelete(e._id)}>
 <Trash2 size={18} />
 </button>
 </div>
 ))}
 </div>

 {showModal && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
 <div className="bg-white p-6 rounded-2xl w-full max-w-md">
 <h3 className="font-bold text-xl mb-4">Add Evidence</h3>
 <form onSubmit={handleAddEvidence} className="flex flex-col gap-3">
 <div className="form-group mb-0">
 <label>Title</label>
 <input required type="text" className="form-control" value={eTitle} onChange={e=>setETitle(e.target.value)} />
 </div>
 <div className="form-group mb-0">
 <label>Link / URL Reference</label>
 <input type="url" className="form-control" placeholder="https://github.com/..." value={eRef} onChange={e=>setERef(e.target.value)} />
 </div>
 <div className="form-group mb-0">
 <label>Relevant Skills (comma separated)</label>
 <input type="text" className="form-control" placeholder="React, Python" value={eSkills} onChange={e=>setESkills(e.target.value)} />
 </div>
 <div className="flex justify-end gap-2 mt-4">
 <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
 <button type="submit" className="btn-primary">Add</button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
