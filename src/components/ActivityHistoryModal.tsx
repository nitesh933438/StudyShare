import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, FileText, Calendar, UploadCloud, Download } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from 'firebase/auth';

interface ActivityRecord {
  id: string;
  type: 'upload' | 'download';
  resourceId: string;
  resourceTitle: string;
  timestamp: any;
}

interface ActivityHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  isDarkMode: boolean;
}

export function ActivityHistoryModal({ isOpen, onClose, user, isDarkMode }: ActivityHistoryModalProps) {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isOpen) return;

    setLoading(true);
    const q = query(
      collection(db, 'users', user.uid, 'activity'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ActivityRecord[];
      setActivities(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching activity history:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isOpen]);

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
            className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}
          >
            <div className={`px-8 py-6 border-b flex items-center justify-between ${
              isDarkMode ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <History className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight leading-tight">My Activity</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Uploads & Downloads</p>
                </div>
              </div>
              <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-grow p-4 min-h-0 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="py-20 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Retrieving activity...</p>
                </div>
              ) : activities.length > 0 ? (
                <div className="space-y-3 px-4 pb-4">
                  {activities.map((item) => (
                    <div
                      key={item.id}
                      className={`p-5 rounded-3xl border flex items-center justify-between ${
                        isDarkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50/50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center ${
                          isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-100'
                        }`}>
                          {item.type === 'upload' ? <UploadCloud className="w-6 h-6 text-indigo-500" /> : <Download className="w-6 h-6 text-emerald-500" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{item.resourceTitle}</h4>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${item.type === 'upload' ? 'text-indigo-500' : 'text-emerald-500'}`}>
                            {item.type}
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {item.timestamp?.toDate?.()?.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center px-8">
                  <h3 className="font-black text-lg mb-2">No Activity</h3>
                  <p className="text-sm text-slate-500">Your uploads and downloads will appear here.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
