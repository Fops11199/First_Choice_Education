import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
      // Mock registration for now
      setTimeout(() => {
        login('mock-token', { 
          id: '2', 
          email: formData.email, 
          full_name: formData.fullName, 
          role: 'student',
          level: formData.level 
        });
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row">
      {/* Visual Section */}
      <div className="hidden md:flex flex-1 bg-deep-blue text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-16">
            <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              First Choice Education
            </span>
          </Link>
          <h1 className="text-4xl font-bold mb-8 leading-tight">
            Start your journey to<br />academic excellence.
          </h1>
          
          <ul className="space-y-4 text-slate-300">
            <li className="flex items-center gap-3">
              <div className="bg-cam-green/20 p-1 rounded-full"><Check className="w-4 h-4 text-cam-green" /></div>
              <span>Access 10+ years of GCE past papers</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="bg-cam-green/20 p-1 rounded-full"><Check className="w-4 h-4 text-cam-green" /></div>
              <span>Step-by-step video walkthroughs</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="bg-cam-green/20 p-1 rounded-full"><Check className="w-4 h-4 text-cam-green" /></div>
              <span>Join a community of 5,000+ students</span>
            </li>
          </ul>
        </div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="md:hidden flex items-center justify-center mb-8">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-deep-blue mb-2 text-center md:text-left">Create your account</h2>
          <p className="text-slate-500 mb-8 text-center md:text-left">Join the best GCE preparation platform in Cameroon.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-cam-red bg-cam-red/10 rounded-xl font-medium">
                {error}
              </div>
            )}
            
            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
              <Input
                label="WhatsApp Number"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                placeholder="6XX XXX XXX"
                helperText="Optional for updates"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">GCE Level</label>
              <select 
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="O-Level">Ordinary Level (O-Level)</option>
                <option value="A-Level">Advanced Level (A-Level)</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          <p className="mt-8 text-center text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:text-primary-dark">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterForm;
