import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '../components/ui/Button';

const ContactPage = () => {
  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="flex justify-center items-center gap-2 mb-3">
          <span className="w-6 h-1 bg-primary"></span>
          <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Contact Support</span>
          <span className="w-6 h-1 bg-primary"></span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-deep-brown mb-4">We're here to help.</h1>
        <p className="text-base text-slate-600">Have a question about a paper or need help with your account? Reach out to our team.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {/* Contact Form */}
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
          <form className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input type="text" placeholder="John Doe" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary focus:outline-none text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <input type="email" placeholder="john@example.com" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary focus:outline-none text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Message</label>
              <textarea rows={4} placeholder="How can we help you?" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary focus:outline-none text-sm resize-none"></textarea>
            </div>
            <Button className="w-full py-3 text-sm">
              <Send className="w-4 h-4 mr-2" /> Send Message
            </Button>
          </form>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-8 flex flex-col justify-center">
          <ContactInfoItem icon={<Mail className="w-5 h-5" />} title="Email Us" value="support@firstchoice.cm" />
          <ContactInfoItem icon={<Phone className="w-5 h-5" />} title="Call/WhatsApp" value="+237 6XX XXX XXX" />
          <ContactInfoItem icon={<MapPin className="w-5 h-5" />} title="Office" value="Yaoundé, Cameroon" />
        </div>
      </div>
    </div>
  );
};

const ContactInfoItem = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) => (
  <div className="flex gap-4">
    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</h4>
      <p className="text-base font-bold text-deep-brown">{value}</p>
    </div>
  </div>
);

export default ContactPage;
