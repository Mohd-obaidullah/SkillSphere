import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { profileAPI, evidenceAPI } from '../services/api';
import { Trash2, Link as LinkIcon, Plus } from 'lucide-react';

export default function Profile() {
 const { state, addSkill, updateSkill, deleteSkill } = useAppContext();
 const [evidence, setEvidence] = useState([]);
 const [loading, setLoading] = useState(true);
 
 const [showModal, setShowModal] = useState(false);
 const [editItemId, setEditItemId] = useState(null);
 const [eTitle, setETitle] = useState('');
 const [eRef, setERef] = useState('');
 const [eSkills, setESkills] = useState('');

 const [showSkillModal, setShowSkillModal] = useState(false);
 const [editSkillId, setEditSkillId] = useState(null);
 const [sName, setSName] = useState('');
 const [sLevel, setSLevel] = useState(33);
 const [sCategory, setSCategory] = useState('');

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

 const handleAddOrUpdateEvidence = async (e) => {
 e.preventDefault();
 try {
     const data = {
         title: eTitle,
         reference: eRef,
         skills: eSkills.split(',').map(s=>s.trim()).filter(Boolean)
     };
     if (editItemId) {
         await evidenceAPI.updateEvidence(editItemId, data);
     } else {
         await evidenceAPI.addEvidence(data);
     }
     setShowModal(false);
     setEditItemId(null);
     setETitle(''); setERef(''); setESkills('');
     fetchEvidence();
 } catch (err) {
     alert(`Failed to ${editItemId ? 'update' : 'add'} evidence`);
 }
 };
 
 const openEditModal = (item) => {
     setEditItemId(item._id);
     setETitle(item.title);
     setERef(item.reference || '');
     setESkills(item.skills ? item.skills.join(', ') : '');
     setShowModal(true);
 };

 const handleAddOrUpdateSkill = async (e) => {
     e.preventDefault();
     try {
         const data = { name: sName, level: parseInt(sLevel), category: sCategory || 'General' };
         if (editSkillId) {
             await updateSkill(editSkillId, data);
         } else {
             await addSkill(data);
         }
         setShowSkillModal(false);
         setEditSkillId(null);
         setSName(''); setSLevel(33); setSCategory('');
     } catch (err) {
         alert(err.response?.data?.msg || `Failed to ${editSkillId ? 'update' : 'add'} skill`);
     }
 };

 const openEditSkillModal = (skill) => {
     setEditSkillId(skill.id);
     setSName(skill.name);
     setSLevel(skill.level || 33);
     setSCategory(skill.category || '');
     setShowSkillModal(true);
 };
 
 const handleDeleteSkill = async (skillId) => {
     if (!window.confirm("Are you sure you want to remove this skill?")) return;
     try {
         await deleteSkill(skillId);
     } catch(err) {
         alert("Failed to remove skill");
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
 
 </div>
 </div>

 <div className="flex items-center justify-between mb-4">
 <h3 className="font-heading text-2xl font-bold">My Skills</h3>
 <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => {
     setEditSkillId(null);
     setSName(''); setSLevel(33); setSCategory('');
     setShowSkillModal(true);
 }}>
 <Plus size={16} /> Add Skill
 </button>
 </div>
 
 <div className="grid gap-4 mb-8">
 {(user.skills || []).length === 0 ? (
     <p className="text-gray-500">No skills added yet.</p>
 ) : (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
     {user.skills.map(s => (
         <div key={s.id} className="glass-card flex justify-between items-center p-4">
             <div>
                 <h4 className="font-bold text-md">{s.name}</h4>
                 <div className="text-xs text-gray-500 mb-1">{s.category}</div>
                 <div className="tag text-[10px] bg-[#C85A32]/10 text-[#C85A32]">
                     {s.level <= 33 ? 'Beginner' : s.level <= 66 ? 'Intermediate' : 'Advanced'}
                 </div>
             </div>
             <div className="flex gap-2">
                 <button className="text-blue-500 p-2 hover:bg-blue-50 rounded" onClick={() => openEditSkillModal(s)}>Edit</button>
                 <button className="text-red-500 p-2 hover:bg-red-50 rounded" onClick={() => handleDeleteSkill(s.id)}>
                     <Trash2 size={16} />
                 </button>
             </div>
         </div>
     ))}
     </div>
 )}
 </div>

 <div className="flex items-center justify-between mb-4">
 <h3 className="font-heading text-2xl font-bold">Learning Evidence</h3>
 <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => {
     setEditItemId(null);
     setETitle(''); setERef(''); setESkills('');
     setShowModal(true);
 }}>
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
 <div className="flex gap-2">
     <button className="text-blue-500 p-2 hover:bg-blue-50 rounded" onClick={() => openEditModal(e)}>
         Edit
     </button>
     <button className="text-red-500 p-2 hover:bg-red-50 rounded" onClick={() => handleDelete(e._id)}>
         <Trash2 size={18} />
     </button>
 </div>
 </div>
 ))}
 </div>

 {showModal && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
 <div className="bg-white p-6 rounded-2xl w-full max-w-md">
 <h3 className="font-bold text-xl mb-4">{editItemId ? 'Edit' : 'Add'} Evidence</h3>
 <form onSubmit={handleAddOrUpdateEvidence} className="flex flex-col gap-3">
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
 <button type="submit" className="btn-primary">{editItemId ? 'Save' : 'Add'}</button>
 </div>
 </form>
 </div>
 </div>
 )}

 {showSkillModal && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
 <div className="bg-white p-6 rounded-2xl w-full max-w-md">
 <h3 className="font-bold text-xl mb-4">{editSkillId ? 'Edit' : 'Add'} Skill</h3>
 <form onSubmit={handleAddOrUpdateSkill} className="flex flex-col gap-3">
 <div className="form-group mb-0">
 <label>Skill Name</label>
 <input required type="text" className="form-control" placeholder="e.g., React, Python" value={sName} onChange={e=>setSName(e.target.value)} disabled={!!editSkillId} />
 </div>
 <div className="form-group mb-0">
 <label>Category (optional)</label>
 <input type="text" className="form-control" placeholder="e.g., Frontend, Database" value={sCategory} onChange={e=>setSCategory(e.target.value)} />
 </div>
 <div className="form-group mb-0">
 <label>Proficiency Level</label>
 <select className="form-control" value={sLevel} onChange={e=>setSLevel(e.target.value)}>
     <option value={33}>Beginner</option>
     <option value={66}>Intermediate</option>
     <option value={100}>Advanced</option>
 </select>
 </div>
 <div className="flex justify-end gap-2 mt-4">
 <button type="button" className="btn-secondary" onClick={() => setShowSkillModal(false)}>Cancel</button>
 <button type="submit" className="btn-primary">{editSkillId ? 'Save' : 'Add'}</button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
