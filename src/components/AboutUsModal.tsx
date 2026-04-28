import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, Heart, Users, Target, ShieldCheck, Mail, Github, Twitter, Linkedin } from 'lucide-react';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export function AboutUsModal({ isOpen, onClose, isDarkMode }: AboutUsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden border max-h-[90vh] flex flex-col ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}
          >
            {/* Header / Hero */}
            <div className={`px-8 py-10 text-center relative overflow-hidden shrink-0 ${
              isDarkMode ? 'bg-indigo-600/10' : 'bg-indigo-600/5'
            }`}>
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
              
              <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 mx-auto mb-6">
                <Info className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-2">About StudyShare</h2>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Empowering Indian Students through Collaborative Learning</p>
              
              <button 
                onClick={onClose}
                className={`absolute top-6 right-6 p-2 rounded-xl transition-colors ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Container */}
            <div className="flex-grow overflow-y-auto px-8 py-10 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Mission Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-orange-500" />
                    </div>
                    <h3 className="font-black uppercase tracking-widest text-xs">Our Mission</h3>
                  </div>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    StudyShare was born with a single vision: to democratize education in India. We believe that money should never be a barrier to high-quality study materials. Our platform provides a free, open-source repository for notes, previous year questions (PYQs), and practical guides.
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-indigo-500" />
                    </div>
                    <h3 className="font-black uppercase tracking-widest text-xs">Why Choose Us?</h3>
                  </div>
                  <ul className={`space-y-3 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    <li className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>100% Free - No hidden subscriptions or paywalls.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Community Driven - Verified resources shared by top students.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Wide Coverage - From B.Tech to Fashion Designing.</span>
                    </li>
                  </ul>
                </div>

                {/* Team / Contact Section */}
                <div className="space-y-8">
                  <div className="p-6 rounded-[2rem] bg-indigo-600 text-white shadow-xl shadow-indigo-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-6 h-6" />
                      <h3 className="font-black tracking-tight text-lg">Student Community</h3>
                    </div>
                    <p className="text-xs font-medium leading-relaxed opacity-90 mb-6">
                      Join thousands of students across India who are making a difference by sharing their knowledge. Your one document could help a fellow student ace their exams!
                    </p>
                    <div className="flex gap-3">
                       <button className="flex-grow py-2.5 rounded-xl bg-white text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-colors">Join Discord</button>
                       <button className="flex-grow py-2.5 rounded-xl bg-white/20 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/30 transition-colors">Donate</button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-black uppercase tracking-widest text-xs">Connect With Us</h3>
                    <div className="flex gap-3">
                      <a href="#" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-indigo-600' : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600'}`}>
                        <Twitter className="w-4 h-4" />
                      </a>
                      <a href="#" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-indigo-600' : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600'}`}>
                        <Github className="w-4 h-4" />
                      </a>
                      <a href="#" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-indigo-600' : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600'}`}>
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a href="mailto:contact@studyshare.in" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-indigo-600' : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600'}`}>
                        <Mail className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`px-8 py-6 border-t text-[10px] font-black uppercase tracking-widest text-slate-400 text-center shrink-0 ${
              isDarkMode ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50/50'
            }`}>
              India's Premier Open Resource Library • V 2.4.0
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
