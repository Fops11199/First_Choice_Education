import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

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
      // TODO: Connect to actual backend API endpoint
      // const response = await api.post('/auth/login', { username: email, password });
      // login(response.data.access_token, response.data.user);
      
      // Mock login for now
      setTimeout(() => {
        login('mock-token', { id: '1', email, full_name: 'Student User', role: 'student' });
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row">
      {/* Visual Section - Hidden on small screens */}
      <div className="hidden md:flex flex-1 bg-deep-blue text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-16">
            <div className="bg-primary p-1.5 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              First Choice Education
            </span>
          </Link>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Your journey to GCE<br />success starts here.
          </h1>
          <p className="text-slate-300 text-lg max-w-md">
            Join thousands of students across Cameroon mastering their subjects with expert video solutions.
          </p>
        </div>
        {/* Decorative background element */}
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
          
          <h2 className="text-2xl sm:text-3xl font-bold text-deep-blue mb-2 text-center md:text-left">Welcome back</h2>
          <p className="text-slate-500 mb-8 text-center md:text-left">Log in to continue your preparation.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-cam-red bg-cam-red/10 rounded-xl font-medium">
                {error}
              </div>
            )}
            
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            
            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <div className="flex justify-end">
                <a href="#" className="text-sm font-medium text-primary hover:text-primary-dark">
                  Forgot password?
                </a>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Log In
            </Button>
          </form>

          <p className="mt-8 text-center text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:text-primary-dark">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginForm;
