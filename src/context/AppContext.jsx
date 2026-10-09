import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_DATA } from '../data/demoData';
import { authAPI, profileAPI, notificationsAPI } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
 const [state, setState] = useState(INITIAL_DATA);
 const [userId, setUserId] = useState(null);
 const [isAuthLoading, setIsAuthLoading] = useState(true);

 useEffect(() => {

 const token = localStorage.getItem('skillsphere_token');
 if (token) {
 authAPI.getMe().then(res => {
 const user = res.data.user;
 setUserId(user._id);
 setState(prev => ({
 ...prev,
 currentUser: { ...prev.currentUser, ...user }
 }));
 }).catch(err => {
 console.error("Session expired or invalid", err);
 logout();
 }).finally(() => {
 setIsAuthLoading(false);
 });
 } else {
 setIsAuthLoading(false);
 }
 }, []);

 const saveState = (newState) => {
 setState(newState);
 };

 const login = (id, userState, token) => {
 setUserId(id);
 localStorage.setItem('skillsphere_token', token);
 
 // We merge the real DB user state with our placeholder demo data (for UI scaffolding)
 setState(prev => ({
 ...prev,
 currentUser: { ...prev.currentUser, ...userState }
 }));
 };

 const logout = () => {
 setUserId(null);
 localStorage.removeItem('skillsphere_token');
 };

 const addNotification = async (title, message, type = 'info') => {
   try {
     const res = await notificationsAPI.createNotification({ title, message, type });
     const newNotif = res.data;
     saveState({ ...state, notifications: [newNotif, ...(state.notifications || [])] });
   } catch (e) {
     console.error("Failed to push notification", e);
   }
 };

 // Profile updaters
 const addSkill = async (skillData) => {
 try {
 const res = await profileAPI.addSkill(skillData);
 setState(prev => ({
 ...prev,
 currentUser: {
 ...prev.currentUser,
 skills: [...(prev.currentUser.skills || []), res.data]
 }
 }));
 return res.data;
 } catch (err) {
 console.error(err);
 throw err;
 }
 };

 const deleteSkill = async (skillId) => {
 try {
 await profileAPI.deleteSkill(skillId);
 setState(prev => ({
 ...prev,
 currentUser: {
 ...prev.currentUser,
 skills: prev.currentUser.skills.filter(s => s.id !== skillId)
 }
 }));
 } catch (err) {
 console.error(err);
 throw err;
 }
 };

 return (
 <AppContext.Provider value={{ 
 state, saveState, userId, login, logout, 
 addNotification, isAuthLoading,
 addSkill, deleteSkill
 }}>
 {children}
 </AppContext.Provider>
 );
}

export function useAppContext() {
 return useContext(AppContext);
}
