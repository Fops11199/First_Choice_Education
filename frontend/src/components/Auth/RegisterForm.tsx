import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  User, Mail, Lock, Eye, EyeOff,
  Phone, GraduationCap, ArrowRight, Loader2, AlertCircle, CheckCircle2, ChevronDown, MapPin, Building2
} from 'lucide-react';
import api from '../../api/api';
import { toast } from 'sonner';
import logo from '../../assets/logo.png';

const RegisterForm = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [level, setLevel] = useState<string>('O-Level');
  const [region, setRegion] = useState<string>('Centre');
  const [currentSchool, setCurrentSchool] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState('');
  const [dbLevels, setDbLevels] = useState<any[]>([]);

  useEffect(() => {
    api.get('/content/levels')
      .then(response => {
        setDbLevels(response.data);
        if (response.data.length > 0 && level === 'O-Level') {
          setLevel(response.data[0].name);
        }
      })
      .catch(err => console.error("Failed to fetch levels:", err));
  }, []);

  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    // Silently prepend +237 for Cameroon
    const whatsappNumber = phone.trim() ? `+237${phone.trim().replace(/^(\+237|237)/, '')}` : undefined;

    const success = await register(fullName, email, password, whatsappNumber, level, region, currentSchool);
    if (success) {
      toast.success('Welcome to First Choice Education!', { description: "Your account is ready. Let's get started!" });
      navigate('/dashboard');
    }
  };

  const displayError = formError || error;

  return (
    <div className="min-h-screen flex">
      {/* Left Branding Panel — desktop only */}
      <div className="hidden lg:flex lg:w-[42%] bg-slate-900 flex-col justify-between p-12 relative overflow-hidden shrink-0">
        {/* Background orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 bg-blue-400/10 rounded-full blur-[100px]" />

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
            Your GCE success<br />starts right here.
          </h2>
          <p className="text-slate-400 font-medium leading-relaxed max-w-xs">
            Join thousands of Cameroonian students preparing for O-Level and A-Level with expert video solutions.
          </p>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 space-y-3">
          {[
            { icon: '🎥', text: '1,000+ Expert Video Solutions' },
            { icon: '📚', text: 'Full GCE Paper Archive' },
            { icon: '👥', text: 'Active Student Community' },
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
      <div className="flex-1 flex flex-col justify-center items-center px-0 sm:px-6 py-12 bg-white overflow-y-auto">
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
            <h1 className="text-2xl font-black text-slate-900 mb-1">Create your account</h1>
            <p className="text-sm text-slate-500 font-medium">
              Already registered?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {displayError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 border border-red-100 p-3.5 rounded-lg mb-6 flex items-center gap-3 text-red-600"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="text-xs font-semibold">{displayError}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <User className="w-3 h-3" /> Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Amara Brice"
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 font-medium placeholder:text-slate-300 text-sm"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Phone className="w-3 h-3" /> WhatsApp Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">+237</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="6XX XXX XXX"
                  maxLength={9}
                  className="w-full pl-16 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 font-medium placeholder:text-slate-300 text-sm"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium ml-0.5">Used to connect you to your class WhatsApp group</p>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Mail className="w-3 h-3" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 font-medium placeholder:text-slate-300 text-sm"
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars"
                    className="w-full px-4 py-3.5 pr-11 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 font-medium placeholder:text-slate-300 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" /> Confirm
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className={`w-full px-4 py-3.5 pr-11 bg-slate-50 border rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 font-medium placeholder:text-slate-300 text-sm ${confirmPassword && confirmPassword !== password ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-primary'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* GCE Level & Region */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <GraduationCap className="w-3 h-3" /> GCE Level
                </label>
                <div className="relative group">
                  <select 
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 font-medium text-sm appearance-none cursor-pointer"
                  >
                    {dbLevels.map((l: any) => (
                      <option key={l.id} value={l.name}>{l.name}</option>
                    ))}
                    {dbLevels.length === 0 && (
                      <>
                        <option value="O-Level">Ordinary Level (O-Level)</option>
                        <option value="A-Level">Advanced Level (A-Level)</option>
                      </>
                    )}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Region
                </label>
                <div className="relative group">
                  <select 
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 font-medium text-sm appearance-none cursor-pointer"
                  >
                    {[
                      'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
                      'North', 'Northwest', 'South', 'Southwest', 'West'
                    ].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                </div>
              </div>
            </div>

            {/* Current School */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Building2 className="w-3 h-3" /> Current School (Optional)
              </label>
              <input
                type="text"
                value={currentSchool}
                onChange={(e) => setCurrentSchool(e.target.value)}
                placeholder="e.g. GBHS Bamenda"
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 font-medium placeholder:text-slate-300 text-sm"
              />
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
                  Create Account & Start Learning
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            By signing up you agree to our{' '}
            <Link to="/terms" className="text-primary hover:underline font-semibold">Terms</Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:underline font-semibold">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterForm;
