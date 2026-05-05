import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

import api from '../../api/api';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const loginData = new URLSearchParams();
      loginData.append('username', email);
      loginData.append('password', password);

      const response = await api.post('/auth/login', loginData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, user, onboarding_required } = response.data;
      login(access_token, user);

      if (onboarding_required) {
        navigate('/onboarding');
      } else if (user.role === 'admin') {
        navigate('/admin_dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Visual Section - Premium Cinematic Split */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative bg-slate-900 overflow-hidden flex-col justify-between p-12">
        {/* Animated Background Gradients */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/40 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: [0, -90, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-indigo-600/40 rounded-full blur-[120px]"
        />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 shadow-xl">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">First Choice<span className="text-primary-light">.</span></span>
        </div>

        <div className="relative z-10 max-w-lg mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] mb-6">
              Master your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-indigo-300">
                GCE Exams.
              </span>
            </h1>
            <p className="text-lg text-slate-300 font-medium leading-relaxed mb-8">
              Join thousands of top-performing students across Cameroon. Access premium video solutions, past papers, and a thriving community.
            </p>
            
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 z-${5-i}`}>
                    {i === 4 ? '+5k' : ''}
                  </div>
                ))}
              </div>
              <div className="text-sm font-bold text-slate-400">
                Active Students <br/>
                <span className="text-white">Learning right now</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[420px]"
        >
          <div className="lg:hidden flex items-center justify-center mb-10">
            <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/20">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h2>
            <p className="text-slate-500 font-medium">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl font-bold flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-red-600"></div>
                {error}
              </motion.div>
            )}
            
            <div className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="py-4 text-base bg-white border-slate-200 shadow-sm"
              />
              
              <div className="space-y-1">
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="py-4 text-base bg-white border-slate-200 shadow-sm"
                />
                <div className="flex justify-end pt-2">
                  <a href="#" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-4 text-base rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all font-bold" 
              isLoading={isLoading}
            >
              Sign In to Dashboard
            </Button>


          </form>

          <p className="mt-10 text-center text-sm font-medium text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-bold hover:text-primary-dark transition-colors">
              Create one now
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginForm;
