import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, UserPlus, Shield, MessageCircle, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const NotificationMenu = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // 10 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
        await api.put(`/notifications/${notification.id}/read`);
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
    }
    
    if (notification.link) {
        navigate(notification.link);
        setIsOpen(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
        case 'community_invite': return <UserPlus className="w-4 h-4 text-emerald-500" />;
        case 'join_request': return <Shield className="w-4 h-4 text-amber-500" />;
        case 'reply': return <MessageCircle className="w-4 h-4 text-primary" />;
        default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-primary transition-colors rounded-full hover:bg-slate-50"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[8px] font-black text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 mt-3 md:w-96 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Notifications</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-sm font-bold text-slate-400">All caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                    {notifications.map((notification) => (
                        <div 
                            key={notification.id} 
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-5 hover:bg-slate-50 transition-colors cursor-pointer relative group ${!notification.is_read ? 'bg-primary/5' : ''}`}
                        >
                            <div className="flex gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border ${!notification.is_read ? 'bg-white border-primary/20' : 'bg-slate-50 border-slate-100'}`}>
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm leading-snug mb-1 ${!notification.is_read ? 'text-slate-900 font-bold' : 'text-slate-600 font-medium'}`}>
                                        {notification.message}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                            {new Date(notification.created_at).toLocaleDateString()}
                                        </span>
                                        {!notification.is_read && (
                                            <button 
                                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-primary/10 text-primary rounded-md hover:bg-primary hover:text-white"
                                            >
                                                <Check className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-50 bg-slate-50/50 text-center">
                <button 
                    onClick={() => {}} 
                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                >
                    View All Activity
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationMenu;
