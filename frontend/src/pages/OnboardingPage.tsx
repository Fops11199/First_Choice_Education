import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Phone, GraduationCap, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const OnboardingPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    whatsappNumber: user?.whatsapp_number || '',
    level: user?.level || 'O-Level',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Update profile
      const response = await api.put('/users/me', {
        whatsapp_number: formData.whatsappNumber,
        level: formData.level
      });
      
      // Update user context silently if needed, or just redirect
      const token = localStorage.getItem('token');
      if (token) {
        login(token, response.data);
      }
      
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err.response?.data?.detail || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-white md:rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-slate-100 min-h-[100vh] md:min-h-0"
      >
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">First Choice Education</span>
          </div>
          <h2 className="text-3xl font-black mb-2 relative z-10">Welcome aboard, {user?.full_name?.split(' ')[0] || 'Scholar'}!</h2>
          <p className="text-slate-300 font-medium relative z-10">Let's finish setting up your profile so we can personalize your learning experience.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-600"></div>
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-1.5">
               <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                <Phone className="w-3.5 h-3.5" />
                WhatsApp Number
              </label>
              <div className="flex gap-2">
                <select className="w-32 px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none">
                  <option value="+237">🇨🇲 +237</option>
                  <option value="+234">🇳🇬 +234</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                </select>
                <div className="relative flex-1">
                  <Input
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    placeholder="6XX XXX XXX"
                    required
                    className="pl-4 bg-slate-50 border-slate-200 shadow-sm w-full"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1.5 ml-1">
                We use this to connect you to your dedicated class group.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Select Your GCE Level
              </label>
              <div className="relative">
                <select 
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full pl-4 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none"
                >
                  <option value="O-Level">Ordinary Level (O-Level)</option>
                  <option value="A-Level">Advanced Level (A-Level)</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Button 
              type="submit" 
              className="w-full py-4 text-base rounded-xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all font-bold group flex items-center justify-center gap-2" 
              isLoading={isLoading}
            >
              Continue to Dashboard
              {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
