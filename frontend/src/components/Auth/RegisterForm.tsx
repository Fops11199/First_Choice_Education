import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../../api/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { BookOpen, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsappNumber: '',
    level: 'O-Level',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError('');
      try {
        const response = await api.post('/auth/google', {
          access_token: tokenResponse.access_token,
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
        console.error('Google login error:', err);
        setError(err.response?.data?.detail || 'Failed to authenticate with Google');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Google login was unsuccessful');
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', {
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        whatsapp_number: formData.whatsappNumber,
        level: formData.level
      });

      // After registration, log them in
      const loginRes = await api.post('/auth/login', new URLSearchParams({
        username: formData.email,
        password: formData.password
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token, user } = loginRes.data;
      login(access_token, user);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      const detail = err.response?.data?.detail;
      
      if (typeof detail === 'object' && detail.field) {
        // Handle specific field error from backend
        setFieldErrors({ [detail.field]: detail.message });
      } else {
        // Handle generic error
        setError(detail || 'Registration failed. Please try again.');
      }
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
            rotate: [0, -90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/40 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: [0, 90, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-indigo-600/40 rounded-full blur-[120px]"
        />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 shadow-xl">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">First Choice<span className="text-primary-light">.</span></span>
        </div>

        <div className="relative z-10 max-w-lg mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] mb-8">
              Begin your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-indigo-300">
                success story.
              </span>
            </h1>
            
            <div className="space-y-6">
              {[
                "Access 10+ years of GCE past papers",
                "Step-by-step HD video walkthroughs",
                "Join a community of 5,000+ students"
              ].map((text, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (index * 0.1) }}
                  key={index} 
                  className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 shadow-lg"
                >
                  <div className="bg-primary/20 p-2 rounded-xl">
                    <Check className="w-5 h-5 text-primary-light" />
                  </div>
                  <span className="text-slate-200 font-medium">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 relative overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[480px] my-auto py-8"
        >
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/20">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Create your account</h2>
            <p className="text-slate-500 font-medium">Join the best GCE preparation platform in Cameroon.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
            
            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              required
              className="bg-white border-slate-200 shadow-sm"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                error={fieldErrors.email}
                className="bg-white border-slate-200 shadow-sm"
              />
              <Input
                label="WhatsApp Number"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                placeholder="6XX XXX XXX"
                error={fieldErrors.whatsappNumber}
                className="bg-white border-slate-200 shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">GCE Level</label>
              <select 
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none"
              >
                <option value="O-Level">Ordinary Level (O-Level)</option>
                <option value="A-Level">Advanced Level (A-Level)</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="bg-white border-slate-200 shadow-sm"
              />
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="bg-white border-slate-200 shadow-sm"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full py-4 mt-2 text-base rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all font-bold" 
              isLoading={isLoading}
            >
              Create Account
            </Button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-400 font-bold tracking-widest uppercase text-[10px]">Or register with</span>
              </div>
            </div>

            <button 
              type="button" 
              onClick={() => handleGoogleLogin()}
              disabled={isLoading}
              className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all font-bold flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Sign up with Google
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-slate-500 pb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:text-primary-dark transition-colors">
              Log in instead
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterForm;
