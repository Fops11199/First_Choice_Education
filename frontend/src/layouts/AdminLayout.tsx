import { useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut, 
  Search, 
  Menu,
  X,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationMenu from '../components/NotificationMenu';

const AdminLayout = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authentication & Authorization check
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-primary">Loading...</div>;
  }

  // Ensure user is authenticated and is an admin
  if (!user || user.role !== 'admin') {
    // If not an admin, we redirect to login (or dashboard if they are just a student)
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin_dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Subjects', path: '/admin_dashboard/subjects', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Users', path: '/admin_dashboard/users', icon: <Users className="w-5 h-5" /> },
    { name: 'Testimonials', path: '/admin_dashboard/testimonials', icon: <Star className="w-5 h-5" /> },
    { name: 'Settings', path: '/admin_dashboard/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-20 flex items-center px-6 border-b border-slate-50">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Admin
            </span>
          </Link>
          <button 
            className="ml-auto lg:hidden text-slate-400 hover:text-slate-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Overview</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                             (item.path !== '/admin_dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Search Bar */}
            <div className="hidden md:flex relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all w-64 lg:w-96 text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <NotificationMenu />
            
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-900 leading-none mb-1">{user?.full_name || 'Admin User'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner">
                {user?.full_name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
