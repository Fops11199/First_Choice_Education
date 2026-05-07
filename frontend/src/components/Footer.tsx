import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Share2, MessageCircle, Globe, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-deep-brown text-white pt-12 md:pt-20 pb-8 md:pb-10 mt-12 md:mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-10 md:mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight uppercase">First Choice</span>
            </Link>
            <p className="text-white/60 font-medium leading-relaxed">
              Empowering Cameroonian students to achieve excellence in their GCE exams through expert-led video solutions and a supportive community.
            </p>
            <div className="flex gap-4">
              <SocialLink href="#" icon={<Globe className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Share2 className="w-5 h-5" />} />
              <SocialLink href="#" icon={<MessageCircle className="w-5 h-5" />} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-accent font-black uppercase tracking-widest text-sm mb-8">Resources</h4>
            <ul className="space-y-4">
              <FooterLink to="/levels">GCE O-Level</FooterLink>
              <FooterLink to="/levels">GCE A-Level</FooterLink>
              <FooterLink to="/subjects">Subject Archive</FooterLink>
              <FooterLink to="/community">Student Forum</FooterLink>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-accent font-black uppercase tracking-widest text-sm mb-8">About Us</h4>
            <ul className="space-y-4">
              <FooterLink to="/about">Our Story</FooterLink>
              <FooterLink to="/contact">Contact Support</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms of Service</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-accent font-black uppercase tracking-widest text-sm mb-8">Get in Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white/60 font-medium">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>Yaoundé, Cameroon</span>
              </li>
              <li className="flex items-center gap-3 text-white/60 font-medium">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>+237 6XX XXX XXX</span>
              </li>
              <li className="flex items-center gap-3 text-white/60 font-medium">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>help@firstchoice.cm</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/40 text-sm font-bold">
            © {currentYear} First Choice Education. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-white/60 text-xs font-black uppercase tracking-widest">Proudly Made in Cameroon</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
  <a 
    href={href} 
    className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-white/60"
  >
    {icon}
  </a>
);

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <li>
    <Link to={to} className="text-white/60 font-medium hover:text-accent transition-colors">
      {children}
    </Link>
  </li>
);

export default Footer;
