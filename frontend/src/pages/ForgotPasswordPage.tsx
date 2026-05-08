import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ArrowLeft, Mail, Key, Lock } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import api from '../api/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'code'>('email');
  
  // State
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await api.post('/auth/forgot-password', { email });
      setStep('code');
      setMessage({ type: 'success', text: 'If your email is registered, we sent a 6-digit code.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to send reset code.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await api.post('/auth/reset-password', {
        email,
        code,
        new_password: newPassword
      });
      setMessage({ type: 'success', text: 'Password reset successfully! Redirecting...' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Invalid or expired code.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Abstract Backgrounds */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 md:p-10 relative z-10 border border-slate-100"
      >
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 p-2.5 rounded-xl">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">First Choice Education</span>
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-2">
          {step === 'email' ? 'Forgot Password?' : 'Reset Password'}
        </h1>
        <p className="text-slate-500 font-medium mb-8 text-sm">
          {step === 'email' 
            ? "Enter your email address and we'll send you a 6-digit code to reset your password."
            : "Enter the 6-digit code we sent to your email along with your new password."}
        </p>

        {message.text && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className={`p-4 text-sm font-bold rounded-xl mb-6 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}
          >
            <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-600'}`}></div>
            {message.text}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.form 
              key="email-form"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendCode} 
              className="space-y-6"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-1.5"><Mail className="w-3 h-3"/> Email Address</label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="name@example.com" 
                  required 
                  className="bg-slate-50"
                />
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full py-4 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 rounded-xl">
                Send Reset Code
              </Button>
            </motion.form>
          ) : (
            <motion.form 
              key="code-form"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              onSubmit={handleResetPassword} 
              className="space-y-5"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-1.5"><Key className="w-3 h-3"/> 6-Digit Code</label>
                <input 
                  type="text" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)} 
                  placeholder="123456" 
                  maxLength={6}
                  required 
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-2xl tracking-[0.5em] font-black focus:outline-none focus:border-primary transition-all text-slate-800 placeholder:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-1.5"><Lock className="w-3 h-3"/> New Password</label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required className="bg-slate-50" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-1.5"><Lock className="w-3 h-3"/> Confirm Password</label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required className="bg-slate-50" />
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full py-4 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 rounded-xl mt-2">
                Reset Password
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
