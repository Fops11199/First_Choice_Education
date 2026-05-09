import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Phone, GraduationCap, Mail, Save, Lock, MapPin, Building2 } from 'lucide-react';
import api from '../api/api';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  
  // Profile State
  const [profileData, setProfileData] = useState({
    fullName: user?.full_name || '',
    whatsappNumber: user?.whatsapp_number || '',
    level: user?.level || 'O-Level',
    region: user?.region || 'Centre',
    currentSchool: user?.current_school || ''
  });
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Handlers
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setProfileMessage({ type: '', text: '' });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordMessage({ type: '', text: '' });
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);
    setProfileMessage({ type: '', text: '' });
    
    try {
      const payload: any = {
        full_name: profileData.fullName,
        whatsapp_number: profileData.whatsappNumber,
        region: profileData.region,
        current_school: profileData.currentSchool
      };
      
      // Only include level if user is a student
      if (user?.role === 'student') {
        payload.level = profileData.level;
      }

      const res = await api.put('/users/me', payload);
      
      // Correctly update the user in AuthContext
      updateUser(res.data);
      
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update profile.' });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    
    setIsPasswordSaving(true);
    setPasswordMessage({ type: '', text: '' });
    
    try {
      await api.post('/users/me/password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });
      
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to change password.' });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 w-full">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-1 bg-accent"></span>
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Settings</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-deep-brown mb-2 tracking-tight">Account Preferences.</h1>
          <p className="text-slate-500 font-medium text-base">Manage your personal information and security protocols.</p>
        </div>

        <div className="bg-slate-900 rounded-2xl px-6 py-4 text-white flex items-center gap-6 shadow-xl border border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Account Status</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${user?.role === 'admin' ? 'bg-amber-400' : user?.role === 'tutor' ? 'bg-blue-400' : 'bg-green-400'}`}></div>
              <span className="text-xs font-bold text-slate-200 capitalize">Active {user?.role}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="relative z-10">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Member Since</p>
            <p className="text-xs font-bold text-white">April 2024</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        
        {/* Profile Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-100 rounded-2xl p-6 md:p-10 shadow-sm flex flex-col"
        >
          <div className="flex items-center gap-3 mb-10 border-b border-slate-100 pb-6">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-deep-brown">Personal Information</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Update your basic identity</p>
            </div>
          </div>

          <form onSubmit={saveProfile} className="space-y-8 flex-1 flex flex-col">
            {profileMessage.text && (
              <div className={`p-5 text-sm font-bold rounded-2xl flex items-center gap-3 ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${profileMessage.type === 'success' ? 'bg-green-500' : 'bg-red-600'}`}></div>
                {profileMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 flex items-center gap-1.5"><User className="w-3 h-3"/> Full Name</label>
                <Input name="fullName" value={profileData.fullName} onChange={handleProfileChange} placeholder="John Doe" required className="bg-slate-50 py-4" />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 flex items-center gap-1.5"><Mail className="w-3 h-3"/> Email Address</label>
                <Input value={user?.email} disabled className="bg-slate-100 text-slate-500 cursor-not-allowed opacity-70 py-4" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 flex items-center gap-1.5"><Phone className="w-3 h-3"/> WhatsApp Number</label>
                <Input name="whatsappNumber" value={profileData.whatsappNumber} onChange={handleProfileChange} placeholder="6XX XXX XXX" className="bg-slate-50 py-4" />
              </div>
              {user?.role === 'student' && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 flex items-center gap-1.5"><GraduationCap className="w-3 h-3"/> GCE Level</label>
                  <select 
                    name="level" value={profileData.level} onChange={handleProfileChange}
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none"
                  >
                    <option value="O-Level">Ordinary Level (O-Level)</option>
                    <option value="A-Level">Advanced Level (A-Level)</option>
                  </select>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 flex items-center gap-1.5"><MapPin className="w-3 h-3"/> Region</label>
                <select 
                  name="region" value={profileData.region} onChange={handleProfileChange}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none"
                >
                  {[
                    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
                    'North', 'Northwest', 'South', 'Southwest', 'West'
                  ].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 flex items-center gap-1.5"><Building2 className="w-3 h-3"/> Current School</label>
                <Input name="currentSchool" value={profileData.currentSchool} onChange={handleProfileChange} placeholder="e.g. GBHS Bamenda" className="bg-slate-50 py-4" />
              </div>
            </div>

            <div className="pt-8 mt-auto flex justify-end">
              <Button type="submit" isLoading={isProfileSaving} className="gap-2 px-10 py-4 text-sm shadow-xl shadow-primary/10 rounded-2xl">
                {!isProfileSaving && <Save className="w-5 h-5" />}
                Sync Profile
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Security Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white border border-slate-100 rounded-2xl p-6 md:p-10 shadow-sm flex flex-col"
        >
          <div className="flex items-center gap-3 mb-10 border-b border-slate-100 pb-6">
            <div className="p-3 bg-accent/10 rounded-2xl text-accent">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-deep-brown">Security</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Manage your access credentials</p>
            </div>
          </div>

          <form onSubmit={savePassword} className="space-y-8 flex-1 flex flex-col">
            {passwordMessage.text && (
              <div className={`p-5 text-sm font-bold rounded-2xl flex items-center gap-3 ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${passwordMessage.type === 'success' ? 'bg-green-500' : 'bg-red-600'}`}></div>
                {passwordMessage.text}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 flex items-center gap-1.5"><Lock className="w-3 h-3"/> Current Password</label>
              <Input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="••••••••" required className="bg-slate-50 py-4 w-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1">New Password</label>
                <Input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="••••••••" required className="bg-slate-50 py-4" />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1">Confirm New</label>
                <Input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="••••••••" required className="bg-slate-50 py-4" />
              </div>
            </div>

            <div className="pt-8 mt-auto">
              <Button type="submit" isLoading={isPasswordSaving} variant="outline" className="gap-2 px-10 py-4 text-sm rounded-2xl w-full md:w-auto">
                Change Password
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
