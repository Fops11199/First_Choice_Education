import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, User, LogOut, Settings, AlertCircle, GraduationCap, ChevronDown } from 'lucide-react';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationMenu from './NotificationMenu';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  const navLinks = [
    ...(user ? [] : [{ name: 'GCE Levels', path: '/levels' }]),
    { name: 'Subjects', path: '/subjects' },
    { name: 'Universities', path: '/universities' },
    { name: 'Community', path: '/community' },
    ...(user ? [{ name: 'Help Center', path: '/help' }] : []),
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
    {/* ── Navbar ────────────────────────────────────────────── */}
    <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
      className="fixed top-0 left-0 right-0 z-[100] h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">

          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="p-1">
              <img src={logo} alt="First Choice Education" className="w-12 h-12 object-contain" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-lg font-black tracking-tight" style={{ color: '#1e293b' }}>
                First Choice <span className="text-blue-600">Education</span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                sponsored by Apostle JOHN CHi
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm font-semibold relative py-1 transition-colors"
                style={{ color: location.pathname === link.path ? '#2563EB' : '#475569' }}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.span layoutId="navUnderline" className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600" />
                )}
              </Link>
            ))}

            <div style={{ width: 1, height: 16, backgroundColor: '#e2e8f0' }} />

            {user ? (
              <div className="flex items-center gap-3">
                <NotificationMenu />

                {/* User dropdown trigger */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(prev => !prev)}
                    style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '6px 12px' }}
                    className="flex items-center gap-2.5 transition-all hover:border-blue-400"
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#2563EB' }}
                      className="flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-bold leading-none mb-0.5" style={{ color: '#1e293b' }}>
                        {user?.full_name?.split(' ')[0]}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#2563EB' }}>
                        {user?.role}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                      style={{ color: '#94a3b8' }} />
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
                        className="absolute right-0 mt-2 w-56 py-2 z-[200]"
                      >
                        {/* Header */}
                        <div className="px-4 py-3 mb-1" style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <p className="text-sm font-bold truncate" style={{ color: '#1e293b' }}>{user?.full_name}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#2563EB' }}>{user?.role}</p>
                        </div>
                        <Link to={getPortalLink()} onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50"
                          style={{ color: '#374151' }}>
                          <GraduationCap className="w-4 h-4" style={{ color: '#2563EB' }} /> Dashboard
                        </Link>
                        <Link to="/settings" onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50"
                          style={{ color: '#374151' }}>
                          <Settings className="w-4 h-4" style={{ color: '#6b7280' }} /> Settings
                        </Link>
                        <div style={{ height: 1, backgroundColor: '#f1f5f9', margin: '4px 12px' }} />
                        <button onClick={() => { setShowUserMenu(false); setShowLogoutConfirm(true); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-red-50 text-left"
                          style={{ color: '#ef4444' }}>
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login"
                  className="text-sm font-semibold px-3 py-2 rounded-lg transition-colors hover:bg-slate-50"
                  style={{ color: '#475569' }}>
                  Sign In
                </Link>
                <Link to="/register"
                  className="text-sm font-bold px-5 py-2 rounded-lg transition-all hover:bg-blue-700"
                  style={{ backgroundColor: '#2563EB', color: '#ffffff', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: notification + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {user && <NotificationMenu />}
            <button
              onClick={() => setIsOpen(!isOpen)}
              style={{ backgroundColor: '#f1f5f9', borderRadius: 10, padding: 8 }}
              className="transition-colors hover:bg-slate-200 active:scale-95"
            >
              {isOpen
                ? <X className="w-5 h-5" style={{ color: '#1e293b' }} />
                : <Menu className="w-5 h-5" style={{ color: '#1e293b' }} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ─────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[150] md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
              className="absolute inset-0 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              style={{ backgroundColor: '#ffffff', borderLeft: '1px solid #e2e8f0' }}
              className="absolute top-0 right-0 bottom-0 w-[300px] flex flex-col shadow-2xl"
            >
              {/* Drawer header */}
              <div className="h-16 px-5 flex items-center justify-between shrink-0"
                style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div className="flex items-center gap-2.5">
                  <div style={{ backgroundColor: '#2563EB', padding: 6, borderRadius: 8 }}>
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold" style={{ color: '#1e293b' }}>First Choice Education</span>
                </div>
                <button onClick={() => setIsOpen(false)}
                  style={{ backgroundColor: '#f1f5f9', borderRadius: 8, padding: 6 }}>
                  <X className="w-4 h-4" style={{ color: '#64748b' }} />
                </button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Nav links */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest px-3 mb-2"
                    style={{ color: '#94a3b8' }}>Navigation</p>
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        style={{
                          display: 'flex',
                          padding: '12px 16px',
                          borderRadius: 12,
                          fontWeight: 700,
                          fontSize: 14,
                          color: location.pathname === link.path ? '#2563EB' : '#334155',
                          backgroundColor: location.pathname === link.path ? '#eff6ff' : 'transparent',
                        }}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Account section */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                  <p className="text-[10px] font-black uppercase tracking-widest px-3 mb-2"
                    style={{ color: '#94a3b8' }}>Account</p>
                  {user ? (
                    <div className="space-y-1">
                      {/* User info card */}
                      <div className="flex items-center gap-3 px-3 py-3 mb-2"
                        style={{ backgroundColor: '#f8fafc', borderRadius: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#2563EB' }}
                          className="flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: '#1e293b' }}>{user?.full_name}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#2563EB' }}>{user?.role}</p>
                        </div>
                      </div>

                      <Link to={getPortalLink()} onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 py-3 px-3 rounded-xl font-bold text-sm"
                        style={{ color: '#334155' }}>
                        <GraduationCap className="w-5 h-5" style={{ color: '#2563EB' }} /> {getPortalName()}
                      </Link>
                      <Link to="/settings" onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 py-3 px-3 rounded-xl font-bold text-sm"
                        style={{ color: '#334155' }}>
                        <Settings className="w-5 h-5" style={{ color: '#64748b' }} /> Settings
                      </Link>
                      <button onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center gap-3 py-3 px-3 rounded-xl font-bold text-sm"
                        style={{ color: '#ef4444' }}>
                        <LogOut className="w-5 h-5" /> Logout
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link to="/login" onClick={() => setIsOpen(false)}
                        className="block w-full text-center py-3.5 font-bold text-sm rounded-xl"
                        style={{ color: '#334155', border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                        Sign In
                      </Link>
                      <Link to="/register" onClick={() => setIsOpen(false)}
                        className="block w-full text-center py-4 font-bold text-sm rounded-xl"
                        style={{ backgroundColor: '#2563EB', color: '#ffffff', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
                        Register Now
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5" style={{ borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                <p className="text-[9px] text-center font-bold tracking-widest uppercase"
                  style={{ color: '#94a3b8' }}>© 2026 First Choice Education</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>

    {/* ── Logout Confirmation Modal ──────────────────────────── */}
    <AnimatePresence>
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
            className="absolute inset-0 backdrop-blur-md"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{ backgroundColor: '#ffffff', borderRadius: 28, border: '1px solid #e2e8f0', boxShadow: '0 40px 80px rgba(0,0,0,0.2)' }}
            className="w-full max-w-sm p-10 relative z-10"
          >
            <div className="flex flex-col items-center text-center">
              <div style={{ width: 80, height: 80, backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: 24 }}
                className="flex items-center justify-center mb-8">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#0f172a' }}>Logout?</h2>
              <p className="text-sm font-medium mb-10" style={{ color: '#64748b' }}>
                Your session will be closed. Ready to head out?
              </p>
              <div className="flex flex-col w-full gap-3">
                <button onClick={handleLogout}
                  className="w-full py-4 text-xs font-bold uppercase tracking-widest rounded-2xl transition-all active:scale-95"
                  style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                  Confirm Logout
                </button>
                <button onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-4 text-xs font-bold uppercase tracking-widest rounded-2xl transition-all"
                  style={{ backgroundColor: '#ffffff', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
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
