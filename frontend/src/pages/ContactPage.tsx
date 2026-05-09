import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, Phone, MapPin, Send, MessageCircle, 
  ExternalLink, Clock, ShieldCheck, Zap 
} from 'lucide-react';
import SEO from '../components/SEO';

const ContactPage = () => {
  const WHATSAPP_NUMBER = "2376XXXXXXXX"; // Replace with real number
  
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <SEO 
        title="Contact Us" 
        description="Get in touch with First Choice Education. We're here to help you with your GCE preparation."
      />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Left: Contact Info */}
          <div className="space-y-12">
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest"
              >
                Reach Out
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight"
              >
                Let's start a <br />
                <span className="text-primary italic">conversation.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-slate-500 font-medium leading-relaxed max-w-md"
              >
                Have questions about our platform or need technical assistance? Our team is ready to help you succeed.
              </motion.p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: <Mail />, title: "Email", value: "help@firstchoice.cm" },
                { icon: <Phone />, title: "Phone", value: "+237 6XX XXX XXX" },
                { icon: <MapPin />, title: "Office", value: "Yaoundé, Cameroon" },
                { icon: <Clock />, title: "Hours", value: "Mon-Sat, 8AM-8PM" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm"
                >
                  <div className="w-10 h-10 bg-slate-50 text-primary rounded-xl flex items-center justify-center mb-4">
                    {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5" })}
                  </div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.title}</h4>
                  <p className="font-bold text-slate-900">{item.value}</p>
                </motion.div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <motion.a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-between p-6 bg-emerald-500 rounded-3xl text-white group hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Live Support</p>
                  <p className="text-lg font-black tracking-tight">Chat on WhatsApp</p>
                </div>
              </div>
              <ExternalLink className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-all mr-2" />
            </motion.a>
          </div>

          {/* Right: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] p-10 lg:p-14 shadow-2xl shadow-slate-200/50 border border-slate-100 relative"
          >
            <div className="space-y-8 relative z-10">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Send a message</h2>
                <p className="text-slate-500 font-medium">We'll get back to you within 24 hours.</p>
              </div>

              <form className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary focus:bg-white focus:outline-none font-medium transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary focus:bg-white focus:outline-none font-medium transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary focus:bg-white focus:outline-none font-medium transition-all appearance-none">
                    <option>General Inquiry</option>
                    <option>Technical Support</option>
                    <option>Billing Question</option>
                    <option>Academic Feedback</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
                  <textarea 
                    rows={4} 
                    placeholder="Tell us how we can help..."
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary focus:bg-white focus:outline-none font-medium transition-all resize-none"
                  ></textarea>
                </div>
                
                <button className="flex items-center justify-center gap-3 w-full py-5 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-primary/20 hover:bg-primary-dark">
                  Send Message <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>

        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          {[
            { icon: <ShieldCheck />, title: "Data Protection", desc: "Your info is encrypted" },
            { icon: <Zap />, title: "Fast Response", desc: "Less than 24h turnaround" },
            { icon: <ExternalLink />, title: "Global Reach", desc: "Supporting all regions" }
          ].map((f, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-sm border border-white p-8 rounded-3xl flex items-center gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary shrink-0">
                {React.cloneElement(f.icon as React.ReactElement<{ className?: string }>, { className: "w-7 h-7" })}
              </div>
              <div>
                <h4 className="font-black text-slate-900">{f.title}</h4>
                <p className="text-slate-500 text-sm font-medium">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

