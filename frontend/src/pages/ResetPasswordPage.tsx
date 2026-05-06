import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, KeyRound, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const code = searchParams.get('code') || '';
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        code,
        new_password: newPassword
      });
      setIsSuccess(true);
      toast.success("Password Reset Successful", {
        description: "You can now log in with your new password."
      });
    } catch (err: any) {
      toast.error("Reset Failed", {
        description: err.response?.data?.detail || "Invalid or expired reset code."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 text-center"
        >
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">All set!</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            Your password has been successfully updated. You can now access your dashboard.
          </p>
          <Link to="/login" className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-primary transition-all active:scale-95 shadow-xl shadow-slate-900/10">
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50/50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 relative overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8">
            <KeyRound className="w-8 h-8" />
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">New Password</h1>
          <p className="text-base font-medium text-slate-500 mb-10">Create a secure password for your account.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="New Password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-slate-50 border-slate-200"
            />
            
            <Input
              label="Confirm New Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-slate-50 border-slate-200"
            />

            <Button 
              type="submit" 
              className="w-full py-4 text-base rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl transition-all font-black flex items-center justify-center gap-3" 
              isLoading={isLoading}
            >
              Update Password
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-10 text-center">
            <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">
              Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
