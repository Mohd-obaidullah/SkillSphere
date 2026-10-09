import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { eventsAPI } from '../services/api';
import { Calendar, Users, MapPin, Search, Clock, Plus, CheckCircle, Ticket } from 'lucide-react';

export default function Events() {
  const { state, addNotification } = useAppContext();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Create Event Modal
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newType, setNewType] = useState('Hackathon');
  const [newDesc, setNewDesc] = useState('');
  const [newRegUrl, setNewRegUrl] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventsAPI.getEvents();
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (eventId) => {
    try {
      await eventsAPI.registerEvent(eventId);
      addNotification("Registered for Event", "You have successfully registered for the event.", "success");
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to register');
    }
  };

  const handleUnregister = async (eventId) => {
    try {
      await eventsAPI.unregisterEvent(eventId);
      addNotification("Unregistered from Event", "You have successfully unregistered.", "info");
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to unregister');
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await eventsAPI.deleteEvent(eventId);
      addNotification("Event Deleted", "Event successfully removed.", "info");
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to delete event');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (newRegUrl && !newRegUrl.startsWith('http://') && !newRegUrl.startsWith('https://')) {
        alert("Registration URL must start with http:// or https://");
        return;
    }
    try {
      await eventsAPI.createEvent({
        title: newTitle,
        date: newDate,
        type: newType,
        description: newDesc,
        registration_url: newRegUrl
      });
      setShowModal(false);
      setNewTitle(''); setNewDate(''); setNewType('Hackathon'); setNewDesc(''); setNewRegUrl('');
      addNotification("Event Created", "Your event is now live!", "success");
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to create event');
    }
  };

  const myId = state.currentUser._id;
  const filteredEvents = events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.type.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-[fadeIn_0.35s_ease-out_forwards]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-heading text-3xl font-extrabold mb-1">Upcoming Events</h2>
          <p className="text-gray-500 text-sm">Register for hackathons, workshops, and study groups.</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>Post an Event</span>
        </button>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search events by title or type..." 
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[rgba(210,200,185,0.5)] focus:border-[#C85A32] focus:outline-none bg-white/50"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 glass-card">No upcoming events found.</div>
        ) : (
          filteredEvents.map(e => {
            const isRegistered = e.attendees?.includes(myId);
            const dateObj = new Date(e.date);
            const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={e._id} className="glass-card flex flex-col justify-between group hover:-translate-y-1 transition-transform cursor-pointer">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="tag bg-[#6B46C1]/10 text-[#6B46C1] text-xs font-bold">{e.type}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-500 flex items-center gap-1"><Users size={14} /> {e.attendees?.length || 0} attending</span>
                      {e.created_by === myId && (
                          <button onClick={() => handleDelete(e._id)} className="text-red-500 hover:text-red-700 text-xs font-bold" title="Delete Event">Delete</button>
                      )}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-[#C85A32] transition-colors">{e.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{e.description}</p>
                  
                  <div className="flex flex-col gap-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <Calendar size={16} className="text-[#C85A32]" />
                      <span>{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <Clock size={16} className="text-[#C85A32]" />
                      <span>{timeStr}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[rgba(210,200,185,0.5)] flex gap-2 flex-wrap">
                  {isRegistered ? (
                    <button onClick={() => handleUnregister(e._id)} className="flex-1 py-2 rounded-xl bg-green-50 text-green-700 font-bold border border-green-200 hover:bg-green-100 transition-colors flex items-center justify-center gap-2">
                      <CheckCircle size={18} />
                      RSVP'd
                    </button>
                  ) : (
                    <button onClick={() => handleRegister(e._id)} className="flex-1 btn-primary py-2 flex items-center justify-center gap-2">
                      <Ticket size={18} />
                      RSVP Here
                    </button>
                  )}
                  {e.registration_url && (
                    <a href={e.registration_url} target="_blank" rel="noopener noreferrer" className="flex-1 btn-secondary text-[#6B46C1] border-[#6B46C1] py-2 flex items-center justify-center gap-2 text-sm font-bold">
                      Ext. Register
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out] overflow-y-auto">
          <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-md shadow-2xl relative animate-[slideUp_0.3s_ease-out] my-8">
            <h3 className="font-bold text-2xl mb-6">Post an Event</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="form-group mb-0">
                <label className="font-semibold text-sm">Event Title</label>
                <input required type="text" className="form-control" value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="e.g. AI Hackathon 2026" />
              </div>
              <div className="form-group mb-0">
                <label className="font-semibold text-sm">Date & Time</label>
                <input required type="datetime-local" className="form-control" value={newDate} onChange={e=>setNewDate(e.target.value)} />
              </div>
              <div className="form-group mb-0">
                <label className="font-semibold text-sm">Event Type</label>
                <select className="form-control" value={newType} onChange={e=>setNewType(e.target.value)}>
                  <option>Hackathon</option>
                  <option>Workshop</option>
                  <option>Study Group</option>
                  <option>Social</option>
                </select>
              </div>
              <div className="form-group mb-0">
                <label className="font-semibold text-sm">Description</label>
                <textarea required className="form-control" rows="3" value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="What is this event about?"></textarea>
              </div>
              <div className="form-group mb-0">
                <label className="font-semibold text-sm">Registration URL (Optional)</label>
                <input type="url" className="form-control" value={newRegUrl} onChange={e=>setNewRegUrl(e.target.value)} placeholder="https://..." />
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" className="px-5 py-2.5 rounded-xl font-semibold text-gray-500 hover:bg-gray-100 transition-colors" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary px-6">Publish Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
