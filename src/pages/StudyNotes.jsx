import React, { useState, useEffect } from 'react';
import { roomsAPI, storageAPI } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { Users, FileText, MessageSquare, Download, Plus, Bot, Share } from 'lucide-react';

export default function StudyNotes() {
 const { state } = useAppContext();
 const [rooms, setRooms] = useState([]);
 const [loading, setLoading] = useState(true);
 
 const [activeRoom, setActiveRoom] = useState(null);
 const [resources, setResources] = useState([]);
 const [questions, setQuestions] = useState([]);
 const [roomMembers, setRoomMembers] = useState([]);
 
 const [showCreate, setShowCreate] = useState(false);
 const [newTitle, setNewTitle] = useState('');
 const [newDesc, setNewDesc] = useState('');
 const [newSubj, setNewSubj] = useState('');

 const [newQuestion, setNewQuestion] = useState('');
 const [uploading, setUploading] = useState(false);

 // AI State
 const [aiQuestion, setAiQuestion] = useState('');
 const [aiLoading, setAiLoading] = useState(false);
 const [aiResult, setAiResult] = useState(null);
 const [aiError, setAiError] = useState(null);

 const [toast, setToast] = useState(null);
 
 const showToast = (msg, type='info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
 };

 const fetchRooms = async () => {
 setLoading(true);
 try {
 const res = await roomsAPI.getRooms();
 setRooms(res.data);
 } catch (e) {
 console.error(e);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchRooms();
 }, []);

 const handleCreateRoom = async (e) => {
 e.preventDefault();
 try {
 await roomsAPI.createRoom({ title: newTitle, description: newDesc, subject: newSubj });
 setShowCreate(false);
 setNewTitle(''); setNewDesc(''); setNewSubj('');
 fetchRooms();
 } catch (e) {
 alert("Failed to create room");
 }
 };

 const handleDeleteRoom = async (roomId) => {
 if (!window.confirm("Are you sure you want to delete this room?")) return;
 try {
 await roomsAPI.deleteRoom(roomId);
 showToast("Room deleted successfully", "success");
 if (activeRoom && activeRoom._id === roomId) {
     setActiveRoom(null);
 }
 fetchRooms();
 } catch (err) {
 alert(err.response?.data?.msg || 'Failed to delete room');
 }
 };

 const handleJoin = async (id) => {
 try {
 await roomsAPI.joinRoom(id);
 fetchRooms();
 } catch (e) {
 alert(e.response?.data?.msg || "Failed to join room");
 }
 };

 const openRoom = async (room) => {
 setActiveRoom(room);
 try {
  const [resData, qData, mData] = await Promise.all([
  roomsAPI.getResources(room._id),
  roomsAPI.getQuestions(room._id),
  roomsAPI.getRoomMembers(room._id)
  ]);
 setResources(resData.data);
 setQuestions(qData.data);
 setRoomMembers(mData.data);
 } catch (e) {
 console.error(e);
 }
 };

 const handleFileUpload = async (e) => {
 const file = e.target.files[0];
 if (!file) return;
 setUploading(true);
 try {
 await storageAPI.uploadDocument(file, activeRoom._id);
 alert("Uploaded!");
 const resData = await roomsAPI.getResources(activeRoom._id);
 setResources(resData.data);
 } catch (err) {
 alert(err.response?.data?.msg || "Upload failed");
 } finally {
 setUploading(false);
 }
 };

 const handleAsk = async (e) => {
 e.preventDefault();
 if (!newQuestion.trim()) return;
 try {
 await roomsAPI.createQuestion(activeRoom._id, { title: newQuestion });
 setNewQuestion('');
 const qData = await roomsAPI.getQuestions(activeRoom._id);
 setQuestions(qData.data);
 } catch (err) {
 alert("Failed to post question");
 }
 };

 const handleAskAI = async (e) => {
 e.preventDefault();
 if (!aiQuestion.trim()) return;
 setAiLoading(true);
 setAiError(null);
 setAiResult(null);
 try {
 const res = await roomsAPI.askAI(activeRoom._id, { question: aiQuestion });
 setAiResult(res.data);
 } catch (err) {
 setAiError(err.response?.data?.msg || "Failed to get AI response. Please try again.");
 } finally {
 setAiLoading(false);
 }
 };

 const shareAiResult = async () => {
 if (!aiResult) return;
 const content = `**Question:** ${aiQuestion}\n\n**Explanation:** ${aiResult.explanation}\n\n**Example:** ${aiResult.example}`;
 try {
 await roomsAPI.createQuestion(activeRoom._id, { title: `AI Shared: ${aiQuestion}`, content });
 const qData = await roomsAPI.getQuestions(activeRoom._id);
 setQuestions(qData.data);
 alert("Shared to Discussions!");
 } catch (e) {
 alert("Failed to share.");
 }
 };

 const myId = state.currentUser?._id;

 if (activeRoom) {
 return (
 <div className="animate-[fadeIn_0.35s_ease-out_forwards]">
 {toast && (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg text-white shadow-lg z-50 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
        {toast.msg}
    </div>
 )}
 <button className="text-gray-500 hover:text-black mb-4 flex items-center gap-1" onClick={() => setActiveRoom(null)}>
 &larr; Back to Rooms
 </button>
 <div className="flex justify-between items-start mb-6">
 <div>
 <h2 className="font-heading text-3xl font-extrabold">{activeRoom.title}</h2>
 <p className="text-gray-500">{activeRoom.description}</p>
 </div>
 <span className="tag bg-[#6B46C1]/10 text-[#6B46C1]">{activeRoom.subject}</span>
 </div>

 <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
 <div className="xl:col-span-2 space-y-6">
 
 {/* AI Assistant Panel */}
 <div className="glass-card bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 ">
 <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-indigo-700 ">
 <Bot size={18} /> AI Doubt Solver
 </h3>
 <form onSubmit={handleAskAI} className="flex gap-2 mb-4">
 <input 
 type="text" 
 className="form-control mb-0 bg-white/70 " 
 placeholder="E.g., Explain binary search with an example..." 
 value={aiQuestion} 
 onChange={e=>setAiQuestion(e.target.value)}
 disabled={aiLoading}
 />
 <button type="submit" className="btn-primary whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 border-indigo-600" disabled={aiLoading || !aiQuestion.trim()}>
 {aiLoading ? 'Thinking...' : 'Ask AI'}
 </button>
 </form>

 {aiError && (
 <div className="p-3 rounded bg-red-100 text-red-700 text-sm mb-4">
 {aiError}
 </div>
 )}

 {aiResult && (
 <div className="bg-white/80 p-4 rounded-xl border border-indigo-100 mt-4 relative">
 <button 
 onClick={shareAiResult}
 className="absolute top-4 right-4 text-xs flex items-center gap-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-2 py-1 rounded"
 title="Share this answer with the room"
 >
 <Share size={12} /> Share to Room
 </button>
 <h4 className="font-bold text-sm mb-2 text-indigo-900 ">Explanation</h4>
 <p className="text-sm text-gray-700 mb-4">{aiResult.explanation}</p>
 
 <h4 className="font-bold text-sm mb-2 text-indigo-900 ">Example</h4>
 <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 mb-4 font-mono">
 {aiResult.example}
 </div>
 
 {aiResult.key_points && aiResult.key_points.length > 0 && (
 <>
 <h4 className="font-bold text-sm mb-2 text-indigo-900 ">Key Points</h4>
 <ul className="list-disc pl-5 text-sm text-gray-700 mb-4">
 {aiResult.key_points.map((pt, i) => <li key={i}>{pt}</li>)}
 </ul>
 </>
 )}
 
 {aiResult.practice_question && (
 <>
 <h4 className="font-bold text-sm mb-2 text-indigo-900 ">Practice Question</h4>
 <p className="text-sm text-gray-700 italic">{aiResult.practice_question}</p>
 </>
 )}
 </div>
 )}
 </div>

 <div className="glass-card">
 <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MessageSquare size={18} /> Room Discussions</h3>
 <form onSubmit={handleAsk} className="flex gap-2 mb-4">
 <input type="text" className="form-control mb-0" placeholder="Ask a question..." value={newQuestion} onChange={e=>setNewQuestion(e.target.value)} />
 <button type="submit" className="btn-primary">Post</button>
 </form>
 <div className="space-y-4">
 {questions.length === 0 ? <p className="text-gray-500 text-sm">No questions yet.</p> : null}
 {questions.map(q => (
 <div key={q._id} className="p-3 border rounded-lg bg-white/50 border-[rgba(210,200,185,0.5)] ">
 <h4 className="font-bold text-sm mb-1">{q.title}</h4>
 {q.content && <p className="text-xs text-gray-600 mb-2 whitespace-pre-wrap">{q.content}</p>}
 <div className="flex items-center gap-2 text-[10px] text-gray-500">
 <img src={q.author?.avatar || 'https://via.placeholder.com/150'} className="w-4 h-4 rounded-full" alt="" />
 <span>{q.author?.name || 'Unknown'}</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 <div className="space-y-6">
 <div className="glass-card">
 <div className="flex justify-between items-center mb-4">
 <h3 className="font-bold text-lg flex items-center gap-2"><FileText size={18} /> Resources</h3>
 <label className="btn-secondary text-xs px-2 py-1 cursor-pointer">
 {uploading ? '...' : 'Upload'}
 <input type="file" className="hidden" accept=".pdf,.md,.txt,.docx" onChange={handleFileUpload} disabled={uploading} />
 </label>
 </div>
 <div className="space-y-3">
 {resources.length === 0 ? <p className="text-gray-500 text-sm">No resources.</p> : null}
 {resources.map(r => (
 <div key={r._id} className="flex items-center justify-between p-2 border rounded-lg border-[rgba(210,200,185,0.5)] ">
 <div className="flex flex-col overflow-hidden">
 <span className="text-sm font-bold truncate">{r.original_filename}</span>
 <span className="text-[10px] text-gray-500">by {r.uploader_name}</span>
 </div>
 <a href={r.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:bg-blue-50 p-1 rounded">
 <Download size={14} />
 </a>
 </div>
 ))}
 </div>
 </div>
 
 <div className="glass-card">
 <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Users size={18} /> Members ({roomMembers.length})</h3>
 <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
 {roomMembers.map(m => (
   <div key={m._id} className="flex items-center gap-3">
     <img src={m.avatar || 'https://via.placeholder.com/150'} alt={m.name} className="w-10 h-10 rounded-full border border-[rgba(210,200,185,0.5)]" />
     <div className="flex flex-col">
       <span className="text-sm font-bold leading-tight">{m.name} {m._id === activeRoom.owner_id && <span className="text-[10px] text-[#C85A32] ml-1 bg-[#C85A32]/10 px-1 rounded">Owner</span>}</span>
       <span className="text-[10px] text-gray-500 line-clamp-1">{m.bio || 'Member'}</span>
     </div>
   </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="animate-[fadeIn_0.35s_ease-out_forwards]">
 {toast && (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg text-white shadow-lg z-50 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
        {toast.msg}
    </div>
 )}
 <div className="flex items-center justify-between mb-8">
 <div>
 <h2 className="font-heading text-3xl font-extrabold mb-1">Study Groups & Rooms</h2>
 <p className="text-gray-500 text-sm">Join a room to share notes, ask questions, and collaborate.</p>
 </div>
 <button className="btn-primary flex items-center gap-2" onClick={() => setShowCreate(true)}><Plus size={16} /> Create Room</button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
 {loading ? <p>Loading rooms...</p> : rooms.length === 0 ? <p className="text-gray-500">No rooms available.</p> : null}
 {rooms.map(room => {
 const isMember = room.members.includes(myId);
 return (
 <div key={room._id} className="glass-card flex flex-col justify-between">
 <div>
 <div className="flex justify-between items-start mb-2">
 <span className="tag bg-[#6B46C1]/10 text-[#6B46C1]">{room.subject}</span>
 <div className="flex gap-2 items-center">
    <span className="text-xs text-gray-500 flex items-center gap-1"><Users size={12}/> {room.members.length}</span>
    {room.owner_id === myId && (
        <button className="text-red-500 hover:text-red-700 text-xs font-bold" onClick={() => handleDeleteRoom(room._id)} title="Delete Room">Delete</button>
    )}
 </div>
 </div>
 <h3 className="font-bold text-lg mb-1">{room.title}</h3>
 <p className="text-sm text-gray-600 mb-4 line-clamp-2">{room.description}</p>
 </div>
 
 {isMember ? (
 <button className="btn-primary w-full" onClick={() => openRoom(room)}>Enter Room</button>
 ) : (
 <button className="btn-secondary w-full border-[#C85A32] text-[#C85A32]" onClick={() => handleJoin(room._id)}>Join Room</button>
 )}
 </div>
 )
 })}
 </div>

 {showCreate && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
 <div className="bg-white p-6 rounded-2xl w-full max-w-md">
 <h3 className="font-bold text-xl mb-4">Create a Room</h3>
 <form onSubmit={handleCreateRoom} className="flex flex-col gap-3">
 <div className="form-group mb-0">
 <label>Title</label>
 <input required type="text" className="form-control" value={newTitle} onChange={e=>setNewTitle(e.target.value)} />
 </div>
 <div className="form-group mb-0">
 <label>Description</label>
 <textarea required className="form-control" value={newDesc} onChange={e=>setNewDesc(e.target.value)}></textarea>
 </div>
 <div className="form-group mb-0">
 <label>Subject / Topic</label>
 <input required type="text" className="form-control" value={newSubj} onChange={e=>setNewSubj(e.target.value)} />
 </div>
 <div className="flex justify-end gap-2 mt-4">
 <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
 <button type="submit" className="btn-primary">Create</button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
