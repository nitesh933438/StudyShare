import React, { useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';
import { Bell, User, Upload, Download, Megaphone, Shield } from 'lucide-react';
import { Notification } from '../data';

export function NotificationListener() {
  const initialized = useRef(false);
  const startTime = useRef(Timestamp.now());

  useEffect(() => {
    // We only want to notify about events that happen AFTER the app is opened
    const q = query(
      collection(db, 'notifications'),
      where('timestamp', '>', startTime.current),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!initialized.current) {
        initialized.current = true;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notif = change.doc.data() as Notification;
          
          toast.custom((t) => (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xl flex gap-3 min-w-[320px] max-w-md animate-in slide-in-from-right-5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-grow">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-0.5">{notif.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{notif.message}</p>
              </div>
              <button 
                onClick={() => toast.dismiss(t)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ), {
            duration: 5000,
            position: 'top-right',
          });
        }
      });
    }, (error) => {
      console.error("NotificationListener snapshot error:", error);
    });

    return () => unsubscribe();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'login': return <User className="w-5 h-5 text-blue-500" />;
      case 'logout': return <User className="w-5 h-5 text-slate-400" />;
      case 'upload': return <Upload className="w-5 h-5 text-indigo-500" />;
      case 'download': return <Download className="w-5 h-5 text-emerald-500" />;
      case 'notice': return <Megaphone className="w-5 h-5 text-amber-500" />;
      case 'admin': return <Shield className="w-5 h-5 text-rose-500" />;
      default: return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return null;
}
