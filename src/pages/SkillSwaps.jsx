import React, { useState, useEffect } from 'react';
import { peersAPI, swapsAPI } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { Search, UserPlus, BookOpen, Check, X, MessageSquare, Plus } from 'lucide-react';

export default function SkillSwaps() {
  const { state } = useAppContext();
  const currentUser = state.currentUser;
  
  const [activeTab, setActiveTab] = useState('discover'); // discover, incoming, sent, active, completed
  
  const [peers, setPeers] = useState([]);
  const [search, setSearch] = useState('');
  
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [swaps, setSwaps] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [swapMessage, setSwapMessage] = useState('');
  
  // Active Swap Modal
  const [activeSwap, setActiveSwap] = useState(null);
  const [sessionNotes, setSessionNotes] = useState('');

  const showToast = (msg, type='info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [peersRes, incRes, sentRes, swapsRes] = await Promise.all([
        peersAPI.getPeers(search),
        swapsAPI.getIncomingRequests(),
        swapsAPI.getSentRequests(),
        swapsAPI.getSwaps()
      ]);
      setPeers(peersRes.data);
      setIncomingRequests(incRes.data);
      setSentRequests(sentRes.data);
      setSwaps(swapsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const openSwapModal = (peer) => {
    setSelectedPeer(peer);
    setTeachSkills([]);
    setLearnSkills([]);
    setSwapMessage('');
    setShowModal(true);
  };
  
  const toggleSkill = (skillList, setSkillList, skillName) => {
      if (skillList.includes(skillName)) {
          setSkillList(skillList.filter(s => s !== skillName));
      } else {
          setSkillList([...skillList, skillName]);
      }
  };

  const handleRequestSwap = async (e) => {
    e.preventDefault();
    if (teachSkills.length === 0 || learnSkills.length === 0) {
        return showToast("Please select at least one skill to teach and learn", "error");
    }
    try {
      await swapsAPI.requestSwap(selectedPeer._id, {
          skills_offered: teachSkills,
          skills_wanted: learnSkills,
          message: swapMessage
      });
      showToast('Skill swap request sent!', 'success');
      setShowModal(false);
      fetchData();
    } catch (e) {
      showToast(e.response?.data?.msg || 'Failed to send request', 'error');
    }
  };

  const handleAccept = async (reqId) => {
    try {
      await swapsAPI.acceptRequest(reqId);
      showToast('Swap accepted!', 'success');
      fetchData();
    } catch(e) {
      showToast(e.response?.data?.msg || 'Failed to accept', 'error');
    }
  };

  const handleReject = async (reqId) => {
    try {
      await swapsAPI.rejectRequest(reqId);
      showToast('Request rejected', 'success');
      fetchData();
    } catch(e) {
      showToast(e.response?.data?.msg || 'Failed to reject', 'error');
    }
  };
  
  const handleAddSession = async (e) => {
      e.preventDefault();
      if (!sessionNotes.trim()) return;
      try {
          await swapsAPI.addSession(activeSwap._id, { notes: sessionNotes });
          setSessionNotes('');
          showToast('Session logged!', 'success');
          fetchData();
          // Update local activeSwap state to show new session
          const updatedSwap = swaps.find(s => s._id === activeSwap._id);
          if (updatedSwap) {
              const newSession = { id: Date.now(), notes: sessionNotes, created_by: currentUser._id, date: new Date().toISOString() };
              setActiveSwap({...activeSwap, sessions: [...activeSwap.sessions, newSession]});
          }
      } catch (e) {
          showToast('Failed to add session', 'error');
      }
  };
  
  const handleCompleteSwap = async (swapId) => {
      if (!window.confirm("Mark this skill swap as completed?")) return;
      try {
          await swapsAPI.completeSwap(swapId);
          showToast('Swap marked as completed!', 'success');
          setActiveSwap(null);
          fetchData();
      } catch (e) {
          showToast('Failed to complete swap', 'error');
      }
  };

  return (
    <div className="animate-[fadeIn_0.35s_ease-out_forwards]">
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg text-white shadow-lg z-50 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
            {toast.msg}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-heading text-3xl font-extrabold mb-1">Skill Swaps</h2>
          <p className="text-gray-500 text-sm">Reciprocal learning with peers. Teach what you know, learn what you don't.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200 mb-6 overflow-x-auto">
          <button className={`pb-3 font-bold text-sm whitespace-nowrap ${activeTab === 'discover' ? 'text-[#C85A32] border-b-2 border-[#C85A32]' : 'text-gray-500 hover:text-black'}`} onClick={() => setActiveTab('discover')}>Discover Peers</button>
          <button className={`pb-3 font-bold text-sm whitespace-nowrap ${activeTab === 'incoming' ? 'text-[#C85A32] border-b-2 border-[#C85A32]' : 'text-gray-500 hover:text-black'}`} onClick={() => setActiveTab('incoming')}>
              Incoming Requests {incomingRequests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{incomingRequests.length}</span>}
          </button>
          <button className={`pb-3 font-bold text-sm whitespace-nowrap ${activeTab === 'sent' ? 'text-[#C85A32] border-b-2 border-[#C85A32]' : 'text-gray-500 hover:text-black'}`} onClick={() => setActiveTab('sent')}>Sent Requests</button>
          <button className={`pb-3 font-bold text-sm whitespace-nowrap ${activeTab === 'active' ? 'text-[#C85A32] border-b-2 border-[#C85A32]' : 'text-gray-500 hover:text-black'}`} onClick={() => setActiveTab('active')}>Active Swaps</button>
          <button className={`pb-3 font-bold text-sm whitespace-nowrap ${activeTab === 'completed' ? 'text-[#C85A32] border-b-2 border-[#C85A32]' : 'text-gray-500 hover:text-black'}`} onClick={() => setActiveTab('completed')}>Completed</button>
      </div>

      {activeTab === 'discover' && (
          <div>
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
              {loading ? <p>Loading peers...</p> : peers.length === 0 ? <p className="text-gray-500">Find students to learn and build with.</p> : null}
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
                  
                  <button className="btn-primary w-full flex items-center justify-center gap-2 mt-2" onClick={() => openSwapModal(p)}>
                    <UserPlus size={16} /> Request Swap
                  </button>
                </div>
              ))}
            </div>
          </div>
      )}

      {activeTab === 'incoming' && (
          <div>
            {incomingRequests.length === 0 ? <p className="text-gray-500">No incoming requests.</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {incomingRequests.map(req => {
                  const p = req.requester;
                  return (
                    <div key={req._id} className="glass-card flex flex-col justify-between border-[#C85A32]/30 bg-white/90">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <img src={p.avatar || 'https://via.placeholder.com/150'} alt={p.name} className="w-12 h-12 rounded-full border border-[#C85A32]" />
                          <div>
                            <h3 className="font-bold text-lg leading-tight">{p.name}</h3>
                            <p className="text-xs text-gray-500">{p.major} @ {p.university}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm border border-gray-200">
                            <p className="font-bold mb-1">Wants to learn:</p>
                            <div className="flex gap-1 flex-wrap mb-2">
                                {req.skills_wanted.map(s => <span key={s} className="tag bg-[#6B46C1]/10 text-[#6B46C1]">{s}</span>)}
                            </div>
                            <p className="font-bold mb-1">Offers to teach:</p>
                            <div className="flex gap-1 flex-wrap mb-2">
                                {req.skills_offered.map(s => <span key={s} className="tag">{s}</span>)}
                            </div>
                            {req.message && (
                                <p className="italic text-gray-600 mt-2 text-xs">"{req.message}"</p>
                            )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button className="btn-primary flex-1" onClick={() => handleAccept(req._id)}>Accept</button>
                        <button className="btn-secondary flex-1 border-red-500 text-red-500 hover:bg-red-50" onClick={() => handleReject(req._id)}>Reject</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
      )}
      
      {activeTab === 'sent' && (
          <div>
            {sentRequests.length === 0 ? <p className="text-gray-500">No sent requests.</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sentRequests.map(req => {
                  const p = req.target;
                  return (
                    <div key={req._id} className="glass-card flex flex-col justify-between opacity-80">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <img src={p.avatar || 'https://via.placeholder.com/150'} alt={p.name} className="w-12 h-12 rounded-full border border-gray-200" />
                          <div>
                            <h3 className="font-bold text-lg leading-tight">Sent to {p.name}</h3>
                            <p className="text-xs text-gray-500">{p.major} @ {p.university}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm border border-gray-200">
                            <p className="font-bold mb-1">I want to learn:</p>
                            <div className="flex gap-1 flex-wrap mb-2">
                                {req.skills_wanted.map(s => <span key={s} className="tag bg-[#6B46C1]/10 text-[#6B46C1]">{s}</span>)}
                            </div>
                            <p className="font-bold mb-1">I offer to teach:</p>
                            <div className="flex gap-1 flex-wrap mb-2">
                                {req.skills_offered.map(s => <span key={s} className="tag">{s}</span>)}
                            </div>
                        </div>
                      </div>
                      <button className="btn-secondary w-full" disabled>Pending Response</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
      )}
      
      {activeTab === 'active' && (
          <div>
            {swaps.filter(s => s.status === 'active').length === 0 ? <p className="text-gray-500">Find a student to start a skill exchange.</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {swaps.filter(s => s.status === 'active').map(s => {
                  const p = s.partner;
                  const amIRequester = s.role === 'requester';
                  const myOffers = amIRequester ? s.skills_offered : s.skills_wanted;
                  const myLearns = amIRequester ? s.skills_wanted : s.skills_offered;
                  return (
                    <div key={s._id} className="glass-card flex flex-col justify-between border-[#6B46C1]/30">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <img src={p.avatar || 'https://via.placeholder.com/150'} alt={p.name} className="w-12 h-12 rounded-full border border-[#6B46C1]" />
                          <div>
                            <h3 className="font-bold text-lg leading-tight">Swap with {p.name}</h3>
                            <p className="text-xs text-gray-500">{p.major}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4 space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold">I Teach:</span>
                                <span className="text-[#C85A32] font-semibold">{myOffers.join(", ")}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold">I Learn:</span>
                                <span className="text-[#6B46C1] font-semibold">{myLearns.join(", ")}</span>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 mb-4">
                            {s.sessions?.length || 0} sessions logged
                        </div>
                      </div>
                      <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={() => setActiveSwap(s)}>
                          <BookOpen size={16} /> Open Swap Room
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
      )}
      
      {activeTab === 'completed' && (
          <div>
            {swaps.filter(s => s.status === 'completed').length === 0 ? <p className="text-gray-500">No completed swaps yet.</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {swaps.filter(s => s.status === 'completed').map(s => {
                  const p = s.partner;
                  return (
                    <div key={s._id} className="glass-card flex flex-col justify-between opacity-70">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <img src={p.avatar || 'https://via.placeholder.com/150'} alt={p.name} className="w-12 h-12 rounded-full grayscale" />
                          <div>
                            <h3 className="font-bold text-lg leading-tight">Completed with {p.name}</h3>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mb-4">
                            {s.sessions?.length || 0} sessions logged
                        </div>
                      </div>
                      <button className="btn-secondary w-full" disabled>Swap Completed</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
      )}

      {showModal && selectedPeer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-2xl">Request Skill Swap</h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black"><X size={24}/></button>
                </div>
                
                <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
                    <img src={selectedPeer.avatar || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded-full" alt="" />
                    <div>
                        <p className="font-bold">{selectedPeer.name}</p>
                        <p className="text-xs text-gray-500">Select what to teach and learn</p>
                    </div>
                </div>

                <form onSubmit={handleRequestSwap}>
                    <div className="mb-6">
                        <label className="block font-bold mb-2 text-[#C85A32]">I can teach {selectedPeer.name}:</label>
                        <p className="text-xs text-gray-500 mb-2">Select from your profile skills</p>
                        <div className="flex flex-wrap gap-2">
                            {currentUser.skills?.length === 0 ? <p className="text-sm text-red-500">You need to add skills to your profile first!</p> : null}
                            {currentUser.skills.map(s => (
                                <button type="button" key={s.name} 
                                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${teachSkills.includes(s.name) ? 'bg-[#C85A32] text-white border-[#C85A32]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#C85A32]'}`}
                                    onClick={() => toggleSkill(teachSkills, setTeachSkills, s.name)}>
                                    {s.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <label className="block font-bold mb-2 text-[#6B46C1]">I want to learn from {selectedPeer.name}:</label>
                        <p className="text-xs text-gray-500 mb-2">Select from their profile skills</p>
                        <div className="flex flex-wrap gap-2">
                            {selectedPeer.skills?.length === 0 ? <p className="text-sm text-red-500">This user has no skills listed.</p> : null}
                            {selectedPeer.skills.map(s => (
                                <button type="button" key={s.name} 
                                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${learnSkills.includes(s.name) ? 'bg-[#6B46C1] text-white border-[#6B46C1]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#6B46C1]'}`}
                                    onClick={() => toggleSkill(learnSkills, setLearnSkills, s.name)}>
                                    {s.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label className="font-bold">Message / Learning Goal</label>
                        <textarea 
                            className="form-control" 
                            placeholder={`Hey ${selectedPeer.name}, I'd love to swap my skills for yours...`}
                            value={swapMessage}
                            onChange={(e) => setSwapMessage(e.target.value)}
                            rows={3}
                        ></textarea>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-8">
                        <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn-primary flex items-center gap-2"><UserPlus size={16}/> Send Request</button>
                    </div>
                </form>
            </div>
        </div>
      )}
      
      {activeSwap && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#C85A32]/10 to-[#6B46C1]/10 p-6 border-b flex justify-between items-center">
                      <div className="flex items-center gap-4">
                          <img src={activeSwap.partner.avatar || 'https://via.placeholder.com/150'} className="w-14 h-14 rounded-full border-2 border-white shadow-sm" alt="" />
                          <div>
                              <h3 className="font-bold text-2xl">Skill Swap with {activeSwap.partner.name}</h3>
                              <p className="text-sm text-gray-600">Goal: {activeSwap.message || 'Learn and grow together'}</p>
                          </div>
                      </div>
                      <button onClick={() => setActiveSwap(null)} className="text-gray-500 hover:text-black bg-white p-2 rounded-full shadow-sm"><X size={20}/></button>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Left Col: Goals */}
                      <div className="md:col-span-1 space-y-6">
                          <div className="bg-white border border-[#C85A32]/30 rounded-xl p-5 shadow-sm">
                              <h4 className="font-bold text-[#C85A32] mb-3 flex items-center gap-2"><BookOpen size={18}/> I will teach</h4>
                              <ul className="space-y-2">
                                  {(activeSwap.role === 'requester' ? activeSwap.skills_offered : activeSwap.skills_wanted).map(s => (
                                      <li key={s} className="flex items-center gap-2 text-sm"><Check size={14} className="text-[#C85A32]"/> {s}</li>
                                  ))}
                              </ul>
                          </div>
                          
                          <div className="bg-white border border-[#6B46C1]/30 rounded-xl p-5 shadow-sm">
                              <h4 className="font-bold text-[#6B46C1] mb-3 flex items-center gap-2"><BookOpen size={18}/> I will learn</h4>
                              <ul className="space-y-2">
                                  {(activeSwap.role === 'requester' ? activeSwap.skills_wanted : activeSwap.skills_offered).map(s => (
                                      <li key={s} className="flex items-center gap-2 text-sm"><Check size={14} className="text-[#6B46C1]"/> {s}</li>
                                  ))}
                              </ul>
                          </div>
                          
                          <button className="btn-secondary w-full border-green-500 text-green-600 hover:bg-green-50" onClick={() => handleCompleteSwap(activeSwap._id)}>
                              Mark Swap as Completed
                          </button>
                      </div>
                      
                      {/* Right Col: Progress & Sessions */}
                      <div className="md:col-span-2 flex flex-col">
                          <h4 className="font-bold text-xl mb-4 flex items-center gap-2"><MessageSquare size={20}/> Learning Log</h4>
                          
                          <div className="flex-1 bg-gray-50 border rounded-xl p-4 mb-4 overflow-y-auto space-y-4 max-h-[40vh]">
                              {activeSwap.sessions?.length === 0 ? (
                                  <div className="text-center text-gray-500 my-8">
                                      <p>No sessions logged yet.</p>
                                      <p className="text-sm">Start learning and track your progress here!</p>
                                  </div>
                              ) : null}
                              
                              {activeSwap.sessions?.map((sess, i) => {
                                  const isMe = sess.created_by === currentUser._id;
                                  return (
                                      <div key={i} className={`p-4 rounded-xl max-w-[85%] shadow-sm ${isMe ? 'bg-white border ml-auto' : 'bg-blue-50 border border-blue-100 mr-auto'}`}>
                                          <div className="flex justify-between items-start mb-2">
                                              <span className="text-xs font-bold text-gray-500">{isMe ? 'Me' : activeSwap.partner.name}</span>
                                              <span className="text-[10px] text-gray-400">{new Date(sess.date).toLocaleDateString()}</span>
                                          </div>
                                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{sess.notes}</p>
                                      </div>
                                  );
                              })}
                          </div>
                          
                          <form onSubmit={handleAddSession} className="flex gap-2">
                              <textarea 
                                  className="form-control mb-0 resize-none" 
                                  placeholder="Log what you learned or taught today..."
                                  value={sessionNotes}
                                  onChange={e => setSessionNotes(e.target.value)}
                                  rows={2}
                              ></textarea>
                              <button type="submit" className="btn-primary self-end flex items-center gap-2 whitespace-nowrap"><Plus size={16}/> Log</button>
                          </form>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
