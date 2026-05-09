import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import logo from '../../assets/logo.png';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const loggedInUser = await login(email, password);
    
    if (loggedInUser) {
      toast.success('Welcome back!', { description: 'You have successfully logged in.' });
      
      // Determine exact dashboard based on role for immediate redirection
      if (!location.state?.from) {
        if (loggedInUser.role === 'admin') {
          navigate('/admin_dashboard', { replace: true });
        } else if (loggedInUser.role === 'tutor') {
          navigate('/tutor_dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        navigate(from, { replace: true });
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Branding Panel — desktop only */}
      <div className="hidden lg:flex lg:w-[42%] bg-slate-900 flex-col justify-between p-12 relative overflow-hidden shrink-0">
        <div className="absolute -top-32 -right-16 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-400/10 rounded-full blur-[100px]" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 mb-16">
            <div className="p-1">
              <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-white text-xl font-black tracking-tight">First Choice Education</span>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                sponsored by Apostle JOHN CHi
              </span>
            </div>
          </Link>

          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Continue your<br />learning journey.
          </h2>
          <p className="text-slate-400 font-medium leading-relaxed max-w-xs">
            Sign in to access your dashboard, track your streaks, and keep your GCE preparation on course.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {[
            { icon: '🔥', text: 'Keep your daily study streak alive' },
            { icon: '📄', text: 'Access all your enrolled papers' },
            { icon: '💬', text: 'Join your class discussion groups' },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <span className="text-lg">{f.icon}</span>
              <span className="text-white/80 text-sm font-semibold">{f.text}</span>
            </div>
          ))}
          <p className="text-center text-white/20 text-[10px] font-bold uppercase tracking-widest pt-4">
            © {new Date().getFullYear()} First Choice Education
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-0 sm:px-6 py-12 bg-white">
        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2.5 lg:hidden mb-8">
          <div className="p-1">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
          </div>
          <div className="flex flex-col -space-y-1 text-left">
            <span className="text-slate-800 text-lg font-black leading-tight">First Choice Education</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              sponsored by Apostle JOHN CHi
            </span>
          </div>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md px-6 sm:px-0"
        >
          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-900 mb-1">Welcome back</h1>
            <p className="text-sm text-slate-500 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Sign up free
              </Link>
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 border border-red-100 p-3.5 rounded-lg mb-6 flex items-center gap-3 text-red-600"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="text-xs font-semibold">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Mail className="w-3 h-3" /> Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 font-medium placeholder:text-slate-300 text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-bold text-primary hover:text-primary-dark uppercase tracking-widest transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 pr-12 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 font-medium placeholder:text-slate-300 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-dark transition-all active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-70 mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginForm;
