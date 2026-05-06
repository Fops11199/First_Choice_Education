import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Mail, Lock, ArrowRight, Globe, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const success = await login(email, password);
    if (success) {
      toast.success("Welcome back!", { description: "You have successfully logged into your account." });
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-100/50 p-8 md:p-12 border border-blue-50 overflow-hidden relative">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="bg-primary p-4 rounded-2xl shadow-xl shadow-primary/20 mb-4"
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">First Choice</h2>
            <p className="text-slate-400 font-medium text-sm mt-1 uppercase tracking-[0.2em]">Success Starts Here</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-8 flex items-center gap-3 text-red-600"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-semibold">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Mail className="w-3 h-3" /> Email Identity
              </label>
              <div className="relative group">
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-6 py-4 bg-blue-50/30 border border-blue-100 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-700 font-medium placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Lock className="w-3 h-3" /> Security Key
                </label>
                <Link to="/forgot-password" size="sm" className="text-[10px] font-bold text-primary hover:text-blue-500 uppercase tracking-widest">
                  Lost Access?
                </Link>
              </div>
              <div className="relative group">
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-blue-50/30 border border-blue-100 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-700 font-medium placeholder:text-slate-300"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-2xl font-semibold text-sm hover:bg-blue-500 transition-all active:scale-[0.98] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Enter Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Social Auth Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-blue-50"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-slate-300">
              <span className="bg-white px-4">Trusted Access</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 bg-white border border-blue-100 rounded-xl hover:bg-blue-50 transition-all group">
              <Globe className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
              <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-white border border-blue-100 rounded-xl hover:bg-blue-50 transition-all group">
              <Mail className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
              <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700">Github</span>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm font-medium text-slate-400">
            New to the platform? <Link to="/register" className="text-primary font-bold hover:underline">Provision an account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;
