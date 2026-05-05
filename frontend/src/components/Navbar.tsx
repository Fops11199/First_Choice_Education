import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Menu, X, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'GCE Levels', path: '/levels' },
    { name: 'Subjects', path: '/subjects' },
    { name: 'Community', path: '/community' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-primary p-2 rounded-lg group-hover:scale-105 transition-all">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              First Choice
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-bold transition-all relative py-1 ${
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
              <div className="flex items-center gap-5">
                <Link to="/dashboard" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-all">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">Portal</span>
                </Link>
                <Link to="/settings" className="text-slate-400 hover:text-primary transition-colors" title="Settings">
                  <Settings className="w-4 h-4" />
                </Link>
                <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors px-3">Sign In</Link>
                <Link to="/register" className="btn-primary py-2 px-6 text-sm rounded-lg font-bold shadow-md shadow-primary/20">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-16 bg-slate-900/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-16 right-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl border-l border-slate-100 flex flex-col"
            >
              <div className="p-6 space-y-6 flex-1">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Navigation</p>
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`block px-4 py-3 rounded-xl text-base font-bold transition-all ${
                        location.pathname === link.path ? 'bg-primary/5 text-primary' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
                
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Account</p>
                  {user ? (
                    <>
                      <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-600 font-bold">
                        <User className="w-5 h-5 text-primary" /> Dashboard
                      </Link>
                      <Link to="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-600 font-bold">
                        <Settings className="w-5 h-5 text-slate-400" /> Settings
                      </Link>
                      <button onClick={() => { logout(); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-bold">
                        <LogOut className="w-5 h-5" /> Logout
                      </button>
                    </>
                  ) : (
                    <div className="grid gap-3">
                      <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center py-3 text-slate-600 font-bold border border-slate-200 rounded-xl">Sign In</Link>
                      <Link to="/register" onClick={() => setIsOpen(false)} className="btn-primary w-full text-center py-3 rounded-xl">Register Now</Link>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 border-t border-slate-50 bg-slate-50/50">
                <p className="text-[10px] text-center text-slate-400 font-medium tracking-tight">© 2024 First Choice Education</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

