import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  List,
  Bell,
  UploadCloud,
  Sun,
  Moon,
  Sparkles,
  Shield,
  Settings,
  Bookmark,
  Info,
  History,
} from "lucide-react";

interface HeaderActionsMenuProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  setIsUploadModalOpen: (val: boolean) => void;
  setIsNoticeModalOpen: (val: boolean) => void;
  setIsBookmarksOpen: (val: boolean) => void;
  setIsAboutUsOpen: (val: boolean) => void;
  setIsDownloadHistoryOpen: (val: boolean) => void;
  isAdminMode: boolean;
  showAdminView: boolean;
  setShowAdminView: (val: boolean) => void;
  setIsAdminModalOpen: (val: boolean) => void;
  setIsAdminMode: (val: boolean) => void;
}

export function HeaderActionsMenu({
  isDarkMode,
  setIsDarkMode,
  setIsUploadModalOpen,
  setIsNoticeModalOpen,
  setIsBookmarksOpen,
  setIsAboutUsOpen,
  setIsDownloadHistoryOpen,
  isAdminMode,
  showAdminView,
  setShowAdminView,
  setIsAdminModalOpen,
  setIsAdminMode,
}: HeaderActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const items = [
    ...(isAdminMode
      ? [
          {
            label: showAdminView ? "Exit Admin View" : "Admin Panel",
            icon: (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Settings className="w-4 h-4" />
              </motion.div>
            ),
            onClick: () => setShowAdminView(!showAdminView),
            color: "text-rose-600 dark:text-rose-400",
            bg: "bg-rose-50 dark:bg-rose-500/10",
          },
        ]
      : []),
    {
      label: "My Bookmarks",
      icon: (
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Bookmark className="w-4 h-4" />
        </motion.div>
      ),
      onClick: () => setIsBookmarksOpen(true),
      color: "text-rose-500 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-500/10",
    },
    {
      label: "My History",
      icon: (
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <History className="w-4 h-4" />
        </motion.div>
      ),
      onClick: () => setIsDownloadHistoryOpen(true),
      color: "text-indigo-500 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-500/10",
    },
    {
      label: "Upload Resource",
      icon: (
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <UploadCloud className="w-4 h-4" />
        </motion.div>
      ),
      onClick: () => setIsUploadModalOpen(true),
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-500/10",
    },
    {
      label: "Post Notice",
      icon: (
        <motion.div
          whileHover={{ rotate: -15, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Bell className="w-4 h-4" />
        </motion.div>
      ),
      onClick: () => setIsNoticeModalOpen(true),
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
    },
    {
      label: "About StudyShare",
      icon: (
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Info className="w-4 h-4" />
        </motion.div>
      ),
      onClick: () => setIsAboutUsOpen(true),
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      label: isAdminMode ? "Exit Admin Mode" : "Admin Access",
      icon: (
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Shield className="w-4 h-4" />
        </motion.div>
      ),
      onClick: () => {
        if (isAdminMode) {
          setIsAdminMode(false);
          setShowAdminView(false);
        } else {
          setIsAdminModalOpen(true);
        }
      },
      color: "text-slate-500 dark:text-slate-400",
      bg: "bg-slate-100 dark:bg-slate-800",
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl transition-all flex items-center justify-center gap-2 border ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
        }`}
        title="More Options"
      >
        <List className="w-5 h-5" />
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
          Menu
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
          >
            {/* Darkened Blur Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            {/* Content Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-lg rounded-[2.5rem] shadow-2xl border overflow-hidden flex flex-col ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 shadow-slate-950/50"
                  : "bg-white border-slate-200 shadow-slate-200/50"
              }`}
            >
              {/* Header with Close Button */}
              <div
                className={`p-6 border-b flex items-center justify-between ${isDarkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-100 bg-slate-50/50"}`}
              >
                <div>
                  <h3
                    className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Navigation
                  </h3>
                  <h2
                    className={`text-xl font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    Quick Menu
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-3 rounded-2xl transition-all ${
                    isDarkMode
                      ? "hover:bg-slate-800 text-slate-400 hover:text-white"
                      : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {items.map((item, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      item.onClick();
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 sm:p-5 rounded-3xl transition-all group border border-transparent ${
                      isDarkMode
                        ? "hover:bg-slate-800 hover:border-slate-700"
                        : "hover:bg-slate-50 hover:border-slate-100"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm ${item.bg} ${item.color}`}
                    >
                      {React.cloneElement(item.icon as React.ReactElement, {
                        className: "w-6 h-6",
                      })}
                    </div>
                    <div className="text-left">
                      <span
                        className={`text-lg font-bold block ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}
                      >
                        {item.label}
                      </span>
                      <span
                        className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                      >
                        Access feature instantly
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div
                className={`p-6 border-t text-center ${isDarkMode ? "border-slate-800 bg-slate-900/10" : "border-slate-50 bg-slate-50/10"}`}
              >
                <p className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-2 uppercase tracking-[0.3em]">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  Effortless Academic Access
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
