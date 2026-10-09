import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { profileAPI, storageAPI } from '../services/api';
import { Save, LogOut, Upload, User, Mail, GraduationCap, Book } from 'lucide-react';

export default function Settings() {
  const { state, saveState, logout, addNotification } = useAppContext();
  const u = state.currentUser;

  const [formData, setFormData] = useState({
    name: u?.name || '',
    university: u?.university || '',
    major: u?.major || '',
    bio: u?.bio || '',
    email: u?.email || '', // Email usually not editable, but display it
  });
  const [avatar, setAvatar] = useState(u?.avatar || '');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const res = await storageAPI.uploadImage(file, true); // true = updateProfile
      setAvatar(res.data.url);
      
      // Update global context
      const user = { ...state.currentUser, avatar: res.data.url };
      saveState({ ...state, currentUser: user });
      addNotification("Avatar Updated", "Your profile picture was successfully updated.", "success");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { name, university, major, bio } = formData;
      const res = await profileAPI.updateProfile({ name, university, major, bio, avatar });
      
      // Update global context
      const user = { ...state.currentUser, ...res.data };
      saveState({ ...state, currentUser: user });
      addNotification("Profile Updated", "Your profile settings have been saved.", "success");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-[fadeIn_0.35s_ease-out_forwards]">
      <div className="mb-8">
        <h2 className="font-heading text-3xl font-extrabold mb-1">Account Settings</h2>
        <p className="text-gray-500 text-sm">Manage your profile information and preferences.</p>
      </div>

      <div className="glass-card mb-8">
        <h3 className="text-xl font-bold mb-6 pb-4 border-b border-[rgba(210,200,185,0.5)]">Profile Information</h3>
        
        <div className="flex flex-col sm:flex-row gap-8 mb-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img 
                src={avatar || 'https://via.placeholder.com/150'} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#C85A32] text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-[#A64B29] transition-colors">
                <Upload size={18} />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={loading} />
              </label>
            </div>
            <span className="text-xs text-gray-500 font-medium">JPG, PNG or GIF. Max 5MB.</span>
          </div>

          <form className="flex-1 flex flex-col gap-5" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="form-group mb-0">
                <label className="flex items-center gap-2"><User size={14}/> Full Name</label>
                <input type="text" name="name" className="form-control" value={formData.name} onChange={handleInputChange} required />
              </div>
              
              <div className="form-group mb-0">
                <label className="flex items-center gap-2"><Mail size={14}/> Email Address</label>
                <input type="email" className="form-control bg-gray-50 text-gray-500 cursor-not-allowed" value={formData.email} disabled />
              </div>

              <div className="form-group mb-0">
                <label className="flex items-center gap-2"><GraduationCap size={14}/> University</label>
                <input type="text" name="university" className="form-control" value={formData.university} onChange={handleInputChange} required />
              </div>

              <div className="form-group mb-0">
                <label className="flex items-center gap-2"><Book size={14}/> Major</label>
                <input type="text" name="major" className="form-control" value={formData.major} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="form-group mb-0">
              <label>Bio</label>
              <textarea 
                name="bio" 
                rows="4" 
                className="form-control" 
                placeholder="Write a short bio about yourself..."
                value={formData.bio}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="btn-primary flex items-center gap-2 px-6" disabled={loading}>
                <Save size={18} />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="glass-card mb-8 border-red-200">
        <h3 className="text-xl font-bold mb-4 text-red-600">Danger Zone</h3>
        <p className="text-sm text-gray-600 mb-4">Logging out will end your current session. You will need to sign in again to access your account.</p>
        <button onClick={logout} className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors flex items-center gap-2">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
