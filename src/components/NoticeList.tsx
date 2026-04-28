import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Notice } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Clock, User } from 'lucide-react';

export function NoticeList() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'notices'),
      orderBy('timestamp', 'desc'),
      limit(6)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const noticeData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notice[];
      setNotices(noticeData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching notices:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notices.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-bold tracking-tight">Public Notices</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {notices.map((notice, idx) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group"
            >
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                {notice.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                {notice.message}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[100px]">{notice.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {notice.timestamp?.toDate() ? 
                      (() => {
                        const diffInDays = Math.round((notice.timestamp.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        if (diffInDays === 0) return 'Today';
                        if (diffInDays === -1) return 'Yesterday';
                        if (diffInDays > 0) return 'Soon';
                        return new Intl.RelativeTimeFormat('en', { style: 'short' }).format(diffInDays, 'day');
                      })() : 'Just now'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
