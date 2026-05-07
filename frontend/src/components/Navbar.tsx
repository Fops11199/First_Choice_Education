import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, User, LogOut, Settings, AlertCircle, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationMenu from './NotificationMenu';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: 'GCE Levels', path: '/levels' },
    { name: 'Subjects', path: '/subjects' },
    { name: 'Community', path: '/community' },
  ];

  const getPortalLink = () => {
    if (user?.role === 'admin') return '/admin_dashboard';
    if (user?.role === 'tutor') return '/tutor_dashboard';
    return '/dashboard';
  };

  const getPortalName = () => {
    if (user?.role === 'admin') return 'Admin Portal';
    if (user?.role === 'tutor') return 'Tutor Portal';
    return 'Student Portal';
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    setIsOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-blue-50 shadow-sm h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-primary p-2 rounded-lg group-hover:scale-105 transition-all">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">
              First Choice
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-semibold transition-all relative py-1 ${
                  location.pathname === link.path ? 'text-primary' : 'text-slate-500 hover:text-primary'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.span layoutId="navUnderline" className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary"></motion.span>
                )}
              </Link>
            ))}
            
            <div className="h-4 w-px bg-slate-200 mx-1"></div>

            {user ? (
              <div className="flex items-center gap-4">
                <NotificationMenu />
                
                <div className="h-4 w-px bg-slate-200 mx-1"></div>

                <div className="relative group/user">
                  <Link to={getPortalLink()} className="flex items-center gap-3 py-1.5 px-3 bg-blue-50/50 rounded-xl border border-blue-100/50 hover:border-primary/30 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[11px] font-bold text-slate-800 leading-none mb-1">{user?.full_name?.split(' ')[0]}</span>
                      <span className="text-[9px] font-bold text-primary uppercase tracking-widest leading-none">{user?.role}</span>
                    </div>
                  </Link>

                  {/* Desktop User Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-white border border-blue-50 rounded-2xl shadow-xl opacity-0 translate-y-2 pointer-events-none group-hover/user:opacity-100 group-hover/user:translate-y-0 group-hover/user:pointer-events-auto transition-all z-[110]">
                    <Link to={getPortalLink()} className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-primary transition-all">
                      <GraduationCap className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-primary transition-all">
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    <div className="h-px bg-slate-50 my-1 mx-2"></div>
                    <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-all text-left">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors px-3">Sign In</Link>
                <Link to="/register" className="bg-primary hover:bg-blue-500 text-white py-2 px-6 text-sm rounded-lg font-bold shadow-md shadow-primary/10 transition-all">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            {user && <NotificationMenu />}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay & Container */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[150] md:hidden">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* The Actual Menu Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-[300px] bg-white shadow-2xl flex flex-col border-l border-blue-50"
            >
              {/* Mobile Header inside Drawer */}
              <div className="h-16 px-6 border-b border-blue-50 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-2.5">
                    <div className="bg-primary p-1.5 rounded-lg">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-slate-800">First Choice</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400">
                   <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-8 flex-1 overflow-y-auto">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Main Menu</p>
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`block px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                        location.pathname === link.path ? 'bg-primary/5 text-primary' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
                
                <div className="pt-6 border-t border-blue-50 space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Account Control</p>
                  {user ? (
                    <div className="space-y-1">
                      <Link to={getPortalLink()} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3.5 text-slate-600 font-bold text-sm rounded-xl hover:bg-blue-50">
                        <GraduationCap className="w-5 h-5 text-primary" /> {getPortalName()}
                      </Link>
                      <Link to="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3.5 text-slate-600 font-bold text-sm rounded-xl hover:bg-blue-50">
                        <Settings className="w-5 h-5 text-slate-400" /> Settings
                      </Link>
                      <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-3 px-4 py-3.5 text-red-500 font-bold text-sm rounded-xl hover:bg-red-50">
                        <LogOut className="w-5 h-5" /> Logout
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-3 pt-2">
                      <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center py-3.5 text-slate-600 font-bold text-sm border border-blue-50 rounded-xl">Sign In</Link>
                      <Link to="/register" onClick={() => setIsOpen(false)} className="bg-primary text-white w-full text-center py-4 rounded-xl font-bold text-sm shadow-lg shadow-primary/20">Register Now</Link>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 border-t border-blue-50 bg-slate-50/50">
                <p className="text-[9px] text-center text-slate-400 font-bold tracking-widest uppercase">© 2026 FIRST CHOICE EDUCATION</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>

    {/* Logout Confirmation Modal */}
    <AnimatePresence>
        {showLogoutConfirm && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    onClick={() => setShowLogoutConfirm(false)}
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 relative shadow-2xl border border-blue-50"
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Logout?</h2>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10">
                            Your session will be closed. Ready to head out?
                        </p>
                        
                        <div className="flex flex-col w-full gap-4">
                            <button 
                                onClick={handleLogout}
                                className="w-full py-5 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
                            >
                                Confirm Logout
                            </button>
                            <button 
                                onClick={() => setShowLogoutConfirm(false)}
                                className="w-full py-5 bg-white text-slate-400 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 border border-blue-50 transition-all"
                            >
                                Keep Browsing
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
    </>
  );
};

export default Navbar;
