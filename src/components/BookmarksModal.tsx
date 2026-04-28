import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bookmark, History, ExternalLink, Calendar, FileText, Search, Trash2, Download } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from 'firebase/auth';

interface BookmarkRecord {
  id: string; // resourceId
  resourceTitle: string;
  fileUrl: string;
  timestamp: any;
}

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  isDarkMode: boolean;
}

export function BookmarksModal({ isOpen, onClose, user, isDarkMode }: BookmarksModalProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user || !isOpen) return;

    setLoading(true);
    const q = query(
      collection(db, 'users', user.uid, 'bookmarks'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BookmarkRecord[];
      setBookmarks(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookmarks history:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isOpen]);

  const removeBookmark = async (resourceId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'bookmarks', resourceId));
    } catch (error) {
      console.error("Failed to remove bookmark", error);
    }
  };

  const filteredBookmarks = bookmarks.filter(b => 
    b.resourceTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm shadow-2xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}
          >
            {/* Header */}
            <div className={`px-8 py-6 border-b flex items-center justify-between ${
              isDarkMode ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Bookmark className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight leading-tight">My Bookmarks</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Your saved study materials</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search */}
            <div className="px-8 pt-6 pb-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search your bookmarks..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl text-sm transition-all border outline-none ${
                    isDarkMode 
                      ? 'bg-slate-950/50 border-slate-800 focus:border-amber-500' 
                      : 'bg-slate-50 border-slate-200 focus:border-amber-500'
                  }`}
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-grow p-4 min-h-0 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="py-20 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading bookmarks...</p>
                </div>
              ) : filteredBookmarks.length > 0 ? (
                <div className="space-y-3 px-4 pb-4">
                  {filteredBookmarks.map((item) => (
                    <motion.div
                      layout
                      key={item.id}
                      className={`p-5 rounded-3xl border transition-all hover:translate-x-1 flex items-center justify-between group ${
                        isDarkMode ? 'bg-slate-800/30 border-slate-800 hover:border-slate-700' : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center transition-colors group-hover:scale-110 duration-300 ${
                          isDarkMode ? 'bg-slate-900 border border-slate-800 text-amber-500' : 'bg-white border border-slate-100 text-amber-500 shadow-sm'
                        }`}>
                          <Bookmark className="w-6 h-6 fill-current" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm truncate pr-2">{item.resourceTitle}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              <Calendar className="w-3 h-3" />
                              {item.timestamp?.toDate?.()?.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) || 'Recent'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            if (item.fileUrl) {
                              const a = document.createElement('a');
                              a.href = item.fileUrl;
                              a.target = '_blank';
                              a.download = item.resourceTitle;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                            }
                          }}
                          className={`p-3 rounded-2xl transition-all hover:bg-indigo-500/10 text-indigo-500 active:scale-95`}
                          title="View resource"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => removeBookmark(item.id)}
                          className={`p-3 rounded-2xl transition-all hover:bg-red-500/10 text-red-500 active:scale-95`}
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center px-8">
                  <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                    isDarkMode ? 'bg-slate-800' : 'bg-slate-50'
                  }`}>
                    <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                  </div>
                  <h3 className="font-black text-lg mb-2">No Bookmarks Yet</h3>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">Found something useful? Bookmark it to easily find it later.</p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className={`px-8 py-5 border-t text-[10px] font-black uppercase tracking-widest text-slate-400 text-center ${
              isDarkMode ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50/50'
            }`}>
              {filteredBookmarks.length} Saved resources
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
