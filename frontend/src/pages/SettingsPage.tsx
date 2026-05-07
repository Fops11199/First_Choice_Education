import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Shield, Phone, GraduationCap, Mail, Save, Lock } from 'lucide-react';
import api from '../api/api';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  
  // Profile State
  const [profileData, setProfileData] = useState({
    fullName: user?.full_name || '',
    whatsappNumber: user?.whatsapp_number || '',
    level: user?.level || 'O-Level'
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
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-1 bg-accent"></span>
          <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Settings</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-deep-brown mb-2">Account Preferences.</h1>
        <p className="text-slate-500 font-medium text-sm">Manage your personal information and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-deep-brown">Personal Information</h2>
            </div>

            <form onSubmit={saveProfile} className="space-y-6">
              {profileMessage.text && (
                <div className={`p-4 text-sm font-bold rounded-xl flex items-center gap-2 ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  <div className={`w-2 h-2 rounded-full ${profileMessage.type === 'success' ? 'bg-green-500' : 'bg-red-600'}`}></div>
                  {profileMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-1.5"><User className="w-3 h-3"/> Full Name</label>
                  <Input name="fullName" value={profileData.fullName} onChange={handleProfileChange} placeholder="John Doe" required className="bg-slate-50" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-1.5"><Mail className="w-3 h-3"/> Email Address</label>
                  <Input value={user?.email} disabled className="bg-slate-100 text-slate-500 cursor-not-allowed opacity-70" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-1.5"><Phone className="w-3 h-3"/> WhatsApp Number</label>
                  <Input name="whatsappNumber" value={profileData.whatsappNumber} onChange={handleProfileChange} placeholder="6XX XXX XXX" className="bg-slate-50" />
                </div>
                {user?.role === 'student' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-1.5"><GraduationCap className="w-3 h-3"/> GCE Level</label>
                    <select 
                      name="level" value={profileData.level} onChange={handleProfileChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none"
                    >
                      <option value="O-Level">Ordinary Level (O-Level)</option>
                      <option value="A-Level">Advanced Level (A-Level)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" isLoading={isProfileSaving} className="gap-2 px-8 py-3 text-sm shadow-md">
                  {!isProfileSaving && <Save className="w-4 h-4" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
              <div className="p-2.5 bg-accent/10 rounded-xl">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-bold text-deep-brown">Security</h2>
            </div>

            <form onSubmit={savePassword} className="space-y-6">
              {passwordMessage.text && (
                <div className={`p-4 text-sm font-bold rounded-xl flex items-center gap-2 ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  <div className={`w-2 h-2 rounded-full ${passwordMessage.type === 'success' ? 'bg-green-500' : 'bg-red-600'}`}></div>
                  {passwordMessage.text}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-1.5"><Lock className="w-3 h-3"/> Current Password</label>
                <Input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="••••••••" required className="bg-slate-50 max-w-md" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5">New Password</label>
                  <Input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="••••••••" required className="bg-slate-50" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Confirm New</label>
                  <Input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="••••••••" required className="bg-slate-50" />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" isLoading={isPasswordSaving} variant="outline" className="gap-2 px-8 py-3 text-sm">
                  Change Password
                </Button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/30 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Account Status</h3>
              <div className="flex items-center gap-2 mb-6">
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${user?.role === 'admin' ? 'bg-amber-400' : user?.role === 'tutor' ? 'bg-blue-400' : 'bg-green-400'}`}></div>
                <span className="text-sm font-semibold text-slate-300 capitalize">Active {user?.role}</span>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Joined</p>
                  <p className="text-sm font-semibold">April 2024</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Role</p>
                  <p className="text-sm font-semibold capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
