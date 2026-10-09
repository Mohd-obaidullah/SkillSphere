import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { authAPI } from '../services/api';

export default function AuthScreen() {
 const [isLogin, setIsLogin] = useState(true);
 const { login, isAuthLoading } = useAppContext();
 
 const [loginEmail, setLoginEmail] = useState('');
 const [loginPass, setLoginPass] = useState('');
 const [loginErr, setLoginErr] = useState('');
 const [loading, setLoading] = useState(false);

 const [regName, setRegName] = useState('');
 const [regEmail, setRegEmail] = useState('');
 const [regUni, setRegUni] = useState('');
 const [regMajor, setRegMajor] = useState('');
 const [regPass, setRegPass] = useState('');
 const [regPass2, setRegPass2] = useState('');
 const [regErr, setRegErr] = useState('');

 if (isAuthLoading) {
 return <div className="min-h-screen flex items-center justify-center bg-[#F7F4EE]">Loading...</div>;
 }

 const handleLogin = async (e) => {
 e.preventDefault();
 setLoginErr('');
 setLoading(true);
 try {
 const res = await authAPI.login({ email: loginEmail, password: loginPass });
 const token = res.data.token;
 
 const meRes = await authAPI.getMe({ headers: { Authorization: `Bearer ${token}` } });
 login(meRes.data.user._id, meRes.data.user, token);
 } catch (err) {
 setLoginErr(err.response?.data?.msg || 'Failed to login. Please try again.');
 } finally {
 setLoading(false);
 }
 };

 const handleRegister = async (e) => {
 e.preventDefault();
 if (regPass !== regPass2) {
 setRegErr("Passwords do not match.");
 return;
 }
 setRegErr('');
 setLoading(true);
 
 try {
 const res = await authAPI.register({
 name: regName, email: regEmail, password: regPass, university: regUni, major: regMajor
 });
 const token = res.data.token;
 
 const meRes = await authAPI.getMe({ headers: { Authorization: `Bearer ${token}` } });
 login(meRes.data.user._id, meRes.data.user, token);
 } catch (err) {
 setRegErr(err.response?.data?.msg || 'Registration failed.');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center p-4 bg-[#F7F4EE]">
 <div className="bg-white border border-[rgba(200,90,50,0.35)] (6,182,212,0.3) rounded-[20px] p-10 w-full max-w-[440px] shadow-2xl">
 <div className="text-center mb-8">
 <div className="w-[52px] h-[52px] mx-auto mb-3 bg-gradient-to-br from-[#C85A32] to-[#6B46C1] rounded-xl flex items-center justify-center shadow-lg">
 <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-7 h-7"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
 </div>
 <h1 className="font-heading text-3xl font-extrabold bg-gradient-to-br from-[#C85A32] to-[#6B46C1] text-transparent bg-clip-text">SKILLSPHERE</h1>
 <p className="text-gray-500 text-sm mt-1">A place where students learn, share & work together</p>
 </div>

 <div className="flex bg-[#F7F4EE] rounded-full p-1 mb-6">
 <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all ${isLogin ? 'bg-white text-[#C85A32] shadow' : 'text-gray-500 hover:text-gray-700'}`}>Sign In</button>
 <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all ${!isLogin ? 'bg-white text-[#C85A32] shadow' : 'text-gray-500 hover:text-gray-700'}`}>Create Account</button>
 </div>

 {isLogin ? (
 <form onSubmit={handleLogin} className="flex flex-col gap-4">
 <div className="form-group mb-0">
 <label>Email Address</label>
 <input type="email" className="form-control" placeholder="you@university.edu" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
 </div>
 <div className="form-group mb-0">
 <label>Password</label>
 <input type="password" className="form-control" placeholder="Enter your password" value={loginPass} onChange={e => setLoginPass(e.target.value)} required />
 </div>
 {loginErr && <div className="text-red-500 text-sm font-semibold p-3 bg-red-50 border border-red-200 rounded-lg">{loginErr}</div>}
 <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">{loading ? 'Loading...' : 'Sign In \u2192'}</button>
 </form>
 ) : (
 <form onSubmit={handleRegister} className="flex flex-col gap-4">
 <div className="form-group mb-0">
 <label>Your Full Name</label>
 <input type="text" className="form-control" placeholder="e.g. Sarah Khan" value={regName} onChange={e => setRegName(e.target.value)} required />
 </div>
 <div className="form-group mb-0">
 <label>Email Address</label>
 <input type="email" className="form-control" placeholder="e.g. sarah@university.edu" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
 </div>
 <div className="form-group mb-0">
 <label>Your School / University</label>
 <input type="text" className="form-control" placeholder="e.g. Punjab University" value={regUni} onChange={e => setRegUni(e.target.value)} required />
 </div>
 <div className="form-group mb-0">
 <label>What you study (Major)</label>
 <input type="text" className="form-control" placeholder="e.g. Computer Science" value={regMajor} onChange={e => setRegMajor(e.target.value)} required />
 </div>
 <div className="form-group mb-0">
 <label>Password</label>
 <input type="password" className="form-control" placeholder="Make a strong password" value={regPass} onChange={e => setRegPass(e.target.value)} required minLength={6} />
 </div>
 <div className="form-group mb-0">
 <label>Confirm Password</label>
 <input type="password" className="form-control" placeholder="Type password again" value={regPass2} onChange={e => setRegPass2(e.target.value)} required />
 </div>
 {regErr && <div className="text-red-500 text-sm font-semibold p-3 bg-red-50 border border-red-200 rounded-lg">{regErr}</div>}
 <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">{loading ? 'Loading...' : 'Create My Account \u2192'}</button>
 </form>
 )}
 </div>
 </div>
 );
}
