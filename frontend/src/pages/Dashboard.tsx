import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Play, FileText, CheckCircle, Clock, Layout, Star, ArrowRight, BookOpen, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();

  const recentActivity = [
    { id: 1, title: 'Maths 2023 Paper 2', subject: 'Maths', level: 'A-Level', status: 'In Progress' },
    { id: 2, title: 'Physics 2022 Paper 1', subject: 'Physics', level: 'A-Level', status: 'Completed' },
    { id: 3, title: 'Chemistry 2021 Paper 3', subject: 'Chemistry', level: 'A-Level', status: 'Flagged' },
  ];

  const progress = [
    { subject: 'Maths', completed: 14, total: 20, color: 'bg-primary' },
    { subject: 'Physics', completed: 8, total: 20, color: 'bg-primary-light' },
    { subject: 'Biology', completed: 0, total: 20, color: 'bg-slate-300' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 w-full">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-1 bg-accent"></span>
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Student Portal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-deep-brown mb-2">Welcome back, {user?.full_name?.split(' ')[0] || 'Scholar'}.</h1>
          <p className="text-slate-500 font-medium text-sm">Continuing GCE {user?.level || 'A-Level'} Preparation</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white border border-slate-100 rounded-xl px-6 py-3 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Rank</p>
              <p className="text-xl font-bold text-deep-brown">#1,402</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Learning Track */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-deep-brown flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" />
              Your Learning Track
            </h2>
            <button className="text-primary font-bold text-sm hover:underline">
              Browse All
            </button>
          </div>
          
          <div className="grid gap-4">
            {recentActivity.map((activity) => (
              <motion.div
                key={activity.id}
                whileHover={{ y: -2 }}
                className="bg-white border border-slate-100 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-primary/20 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-background p-3 rounded-lg">
                    <FileText className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-deep-brown mb-1">{activity.title}</h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <span className="text-primary uppercase tracking-widest">{activity.subject}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{activity.level}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
                  <Badge variant={
                    activity.status === 'Completed' ? 'success' :
                    activity.status === 'In Progress' ? 'warning' : 'outline'
                  }>
                    {activity.status}
                  </Badge>
                  <Button variant="primary" size="sm" className="rounded-lg px-6">
                    Resume
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Performance */}
        <div className="space-y-8">
          <h2 className="text-xl font-bold text-deep-brown">Subject Mastery</h2>
          
          <div className="bg-deep-brown text-white rounded-2xl p-6 space-y-8 shadow-md relative overflow-hidden">
            {/* Subtle pattern background for the card */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <pattern id="dash-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M0 20L20 0H10L0 10V20Z" fill="currentColor" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#dash-pattern)" />
              </svg>
            </div>

            <div className="relative z-10 space-y-6">
              {progress.map((stat) => (
                <div key={stat.subject}>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-xs font-bold text-accent uppercase tracking-widest">{stat.subject}</p>
                      <p className="text-[10px] font-bold text-white/50">{stat.completed} papers solved</p>
                    </div>
                    <span className="text-lg font-bold">{Math.round((stat.completed/stat.total)*100)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(stat.completed / stat.total) * 100}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={`h-full rounded-full ${stat.color === 'bg-primary' ? 'bg-accent' : stat.color}`}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative z-10 pt-4 border-t border-white/10">
              <Button variant="outline" className="w-full justify-between text-white border-white/20 hover:bg-white/5 rounded-lg text-sm">
                View Full Report <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
            <h3 className="text-base font-bold text-deep-brown mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-accent fill-accent" />
              Community Tips
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium mb-4">
              "Focus on Biology Paper 2 from 2018. It covers 40% of the core topics for this year's session."
            </p>
            <button className="text-primary font-semibold text-sm hover:underline">Read more tips</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
