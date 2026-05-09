import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, Mail, HelpCircle, 
  ChevronRight, ExternalLink, ShieldCheck, 
  Clock, LifeBuoy, Zap
} from 'lucide-react';

const HelpPage = () => {
  const WHATSAPP_NUMBER = "2376XXXXXXXX"; // Replace with real number
  const SUPPORT_EMAIL = "help@firstchoice.cm";

  const contactMethods = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Support',
      description: 'Get instant answers from our academic tutors and support team.',
      icon: <MessageCircle className="w-8 h-8" />,
      color: 'bg-emerald-500',
      actionText: 'Chat Now',
      link: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello First Choice Support, I need help with...")}`,
      badge: 'Fastest Response'
    },
    {
      id: 'email',
      name: 'Email Support',
      description: 'For account issues, payment inquiries, or detailed feedback.',
      icon: <Mail className="w-8 h-8" />,
      color: 'bg-blue-600',
      actionText: 'Send Email',
      link: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Support Request - First Choice Education")}&body=${encodeURIComponent("Hello Support Team,\n\nI am reaching out regarding...")}`,
      badge: '24h Response'
    }
  ];

  const faqs = [
    { q: "How do I access video solutions?", a: "Once you are logged in, navigate to 'Subjects', select your subject and level, then pick a paper to see the list of solutions." },
    { q: "Can I watch videos offline?", a: "Currently, our platform requires an active internet connection to ensure you always have the latest content and community updates." },
    { q: "How do I update my profile?", a: "Go to your Profile settings from the top right menu to change your name, region, or school details." },
    { q: "Is the community free to join?", a: "Yes! Every registered student has access to our subject communities to discuss and learn together." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4"
          >
            <HelpCircle className="w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            How can we <span className="text-primary">help you?</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
            We are here to support your GCE success. Whether you have a technical issue or need academic guidance, choose a method below.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 space-y-12">
        {/* Contact Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {contactMethods.map((method, idx) => (
            <motion.div
              key={method.id}
              initial={{ x: idx === 0 ? -20 : 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:border-primary/20 transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/5 transition-all" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-start justify-between">
                  <div className={`w-16 h-16 ${method.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                    {method.icon}
                  </div>
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {method.badge}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">{method.name}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    {method.description}
                  </p>
                </div>

                <a 
                  href={method.link}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                    method.id === 'whatsapp' 
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20 shadow-xl hover:bg-emerald-600' 
                      : 'bg-primary text-white shadow-primary/20 shadow-xl hover:bg-primary-dark'
                  }`}
                >
                  {method.actionText} <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Clock />, title: "Support Hours", desc: "Mon-Sat, 8AM - 8PM" },
            { icon: <ShieldCheck />, title: "Safe & Secure", desc: "Your data is protected" },
            { icon: <Zap />, title: "Expert Tutors", desc: "Verified GCE specialists" }
          ].map((f, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-sm border border-white/40 p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary shrink-0">
                {React.cloneElement(f.icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" })}
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm">{f.title}</h4>
                <p className="text-slate-500 text-xs font-bold">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-3xl p-10 lg:p-12 shadow-sm border border-slate-100">
           <div className="flex items-center gap-3 mb-10">
             <div className="w-1.5 h-8 bg-primary rounded-full" />
             <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Frequently Asked Questions</h2>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
              {faqs.map((faq, i) => (
                <div key={i} className="space-y-3 group">
                  <h4 className="text-lg font-black text-slate-800 flex items-start gap-3">
                    <span className="text-primary mt-1"><ChevronRight className="w-5 h-5" /></span>
                    {faq.q}
                  </h4>
                  <p className="text-slate-500 font-medium leading-relaxed pl-8">
                    {faq.a}
                  </p>
                </div>
              ))}
           </div>
        </div>

        {/* Help Banner */}
        <div className="bg-slate-900 rounded-3xl p-10 lg:p-16 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
           <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
             <div className="space-y-4 text-center lg:text-left">
               <h2 className="text-3xl font-black text-white">Still have questions?</h2>
               <p className="text-slate-400 font-medium text-lg">Our team is always ready to guide you through your journey.</p>
             </div>
             <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
               <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-8 py-6 rounded-2xl">
                 <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                   <LifeBuoy className="w-6 h-6" />
                 </div>
                 <div>
                   <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Office Location</p>
                   <p className="text-white font-bold">Yaoundé, Cameroon</p>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
