import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  User,
  Upload,
  Download,
  Megaphone,
  Shield,
  Clock,
  Check,
  Trash2,
} from "lucide-react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { Notification } from "../data";
import { toast } from "sonner";

export function NotificationDropdown({ isDarkMode }: { isDarkMode: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isClearing, setIsClearing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      orderBy("timestamp", "desc"),
      limit(20),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    }, (error) => {
      console.error("Notification snapshot error:", error);
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAsRead = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!auth.currentUser) {
      toast.error("Please login to perform this action");
      return;
    }

    try {
      setIsClearing(true);
      const q = query(
        collection(db, "notifications"),
        where("read", "==", false),
        limit(500),
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setIsClearing(false);
        return;
      }

      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => {
        batch.update(d.ref, { read: true });
      });
      await batch.commit();
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Error marking all as read:", err);
      toast.error("Failed to mark as read");
    } finally {
      setIsClearing(false);
    }
  };

  const clearAllNotifications = async () => {
    if (!auth.currentUser) {
      toast.error("Please login to clear notifications");
      return;
    }

    if (!confirm("Are you sure you want to clear all notifications?")) return;

    try {
      setIsClearing(true);
      
      // Keep clearing in batches until no notifications are left
      let stillHasNotifications = true;
      let totalDeleted = 0;
      
      while (stillHasNotifications) {
        const snapshot = await getDocs(query(collection(db, "notifications"), limit(100)));
        if (snapshot.empty) {
          stillHasNotifications = false;
          break;
        }

        const batch = writeBatch(db);
        snapshot.docs.forEach((d) => {
          batch.delete(d.ref);
        });
        await batch.commit();
        totalDeleted += snapshot.size;
      }
      
      toast.success(`Notifications cleared completely (${totalDeleted} removed)`);
    } catch (err) {
      console.error("Error clearing notifications:", err);
      toast.error("Failed to clear notifications. You might lack permissions.");
    } finally {
      setIsClearing(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "login":
        return <User className="w-4 h-4 text-blue-500" />;
      case "logout":
        return <User className="w-4 h-4 text-slate-400" />;
      case "upload":
        return <Upload className="w-4 h-4 text-indigo-500" />;
      case "download":
        return <Download className="w-4 h-4 text-emerald-500" />;
      case "notice":
        return <Megaphone className="w-4 h-4 text-amber-500" />;
      case "admin":
        return <Shield className="w-4 h-4 text-rose-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-all border border-transparent ${
          isDarkMode
            ? "hover:bg-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-100"
            : "hover:bg-slate-100 hover:border-slate-200 text-slate-600 hover:text-slate-900"
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md">
            {unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/20 backdrop-blur-[2px] z-[90] sm:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`fixed sm:absolute inset-x-4 sm:inset-auto sm:right-0 top-20 sm:top-full sm:w-80 md:w-96 sm:mt-3 rounded-2xl shadow-2xl border overflow-hidden z-[100] origin-top-right sm:max-h-[80vh] flex flex-col ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 shadow-indigo-900/20"
                  : "bg-white border-slate-200 shadow-slate-200/50"
              }`}
            >
              <div
                className={`p-4 border-b flex items-center justify-between ${
                  isDarkMode
                    ? "border-slate-800 bg-slate-900/50"
                    : "border-slate-100 bg-slate-50/50"
                }`}
              >
                <h3
                  className={`text-sm font-bold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}
                >
                  Notifications
                </h3>
                <div className="flex items-center gap-3">
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      disabled={isClearing}
                      className={`text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-1 transition-all ${
                        isClearing ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Trash2 className="w-3 h-3" />
                      {isClearing ? "Clearing..." : "Clear All"}
                    </button>
                  )}
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      disabled={isClearing}
                      className={`text-[10px] font-bold text-fuchsia-600 dark:text-fuchsia-400 hover:underline flex items-center gap-1 transition-all ${
                        isClearing ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      Mark all as read
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 text-center"
                  >
                    <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-tight">
                      No notifications yet
                    </p>
                  </motion.div>
                ) : (
                  notifications.map((notif, idx) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-4 flex gap-3 cursor-pointer transition-colors border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                        isDarkMode ? "border-slate-800" : "border-slate-50"
                      } ${
                        !notif.read
                          ? isDarkMode
                            ? "bg-fuchsia-500/5"
                            : "bg-fuchsia-50/50"
                          : isDarkMode
                            ? "hover:bg-slate-800/50"
                            : "hover:bg-slate-50/50"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isDarkMode ? "bg-slate-800" : "bg-slate-100"
                        }`}
                      >
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <p
                            className={`text-xs font-bold leading-tight truncate pr-2 ${
                              isDarkMode ? "text-slate-200" : "text-slate-800"
                            }`}
                          >
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="w-2 h-2 bg-indigo-500 rounded-full mt-1 shrink-0" />
                          )}
                        </div>
                        <p
                          className={`text-[11px] leading-relaxed line-clamp-2 ${
                            isDarkMode ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          <Clock className="w-2.5 h-2.5" />
                        {notif.timestamp?.toDate ? 
                          (() => {
                            try {
                              return notif.timestamp.toDate().toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                                hour12: true,
                              });
                            } catch (e) {
                              return "Just now";
                            }
                          })()
                          : "Just now"}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
