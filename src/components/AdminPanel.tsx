import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sendNotification } from '../lib/notifications';
import { 
  Plus, Edit2, Trash2, X, Save, ArrowLeft, Users, 
  FileText, Megaphone, LayoutDashboard, Search,
  TrendingUp, Download, Star, ShieldCheck, History, LogIn, Bell, Sun, Moon
} from 'lucide-react';
import { Resource, Course, Branch, Subject, ResourceType, COURSE_BRANCHES, COURSE_BRANCH_SUBJECTS, Notice } from '../data';
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc, getDocs, orderBy, setDoc, serverTimestamp, where, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';

const COURSES: Exclude<Course, 'All'>[] = ['B.Tech', 'M.Tech', 'Diploma Engineering', 'BCA', 'MCA', 'BBA', 'MBA', 'B.Com', 'M.Com', 'BA', 'MA', 'B.Sc', 'M.Sc', 'LLB', 'LLM', 'MBBS', 'BDS', 'B.Pharm', 'D.Pharm', 'Nursing', 'B.Ed', 'D.El.Ed', 'BHM', 'BTTM', 'BJMC', 'BFA', 'Fashion Designing'];
const TYPES: Exclude<ResourceType, 'All'>[] = ['Notes', 'Question Bank', 'Assignment', 'Practical', 'PYQ', 'Other'];

type AdminTab = 'dashboard' | 'resources' | 'notices' | 'users' | 'activity';

interface AdminPanelProps {
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function AdminPanel({ resources, setResources, onClose, isDarkMode, onToggleTheme }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formCourse, setFormCourse] = useState<Exclude<Course, 'All'>>(COURSES[0]);
  const [formBranch, setFormBranch] = useState<string>(COURSE_BRANCHES[COURSES[0]][0]);
  
  const [allNotices, setAllNotices] = useState<Notice[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [globalActivity, setGlobalActivity] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [noticesSearchQuery, setNoticesSearchQuery] = useState('');

  useEffect(() => {
    // Sync Notices
    const qNotices = query(collection(db, 'notices'), orderBy('timestamp', 'desc'));
    const unsubNotices = onSnapshot(qNotices, (snapshot) => {
      setAllNotices(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Notice[]);
    }, (error) => {
      console.error("AdminPanel: Notices snapshot error:", error);
    });

    // Sync Users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setAllUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.error("AdminPanel: Users snapshot error:", error);
    });

    // Sync Global Activity (simplified, maybe last 100)
    const qActivity = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(100));
    const unsubActivity = onSnapshot(qActivity, (snapshot) => {
      setGlobalActivity(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.error("AdminPanel: Activity snapshot error:", error);
    });

    return () => {
      unsubNotices();
      unsubUsers();
      unsubActivity();
    };
  }, []);

  useEffect(() => {
    if (editingResource) {
      setFormCourse(editingResource.course);
      setFormBranch(editingResource.branch);
    }
  }, [editingResource]);

  const formSubjects = COURSE_BRANCH_SUBJECTS[formCourse]?.[formBranch] || [];

  const handleDeleteResource = async (id: string) => {
    if (confirm('Delete this resource permanently?')) {
      try {
        await deleteDoc(doc(db, 'resources', id));
        toast.success('Resource deleted');
        sendNotification('admin', 'Resource Deleted', `Admin deleted a resource.`);
      } catch (e) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (confirm('Delete this notice?')) {
      try {
        await deleteDoc(doc(db, 'notices', id));
        toast.success('Notice deleted');
      } catch (e) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleSaveResource = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const resourceData = {
      title: formData.get('title') as string,
      author: formData.get('author') as string,
      course: formData.get('course') as Course,
      branch: formData.get('branch') as Branch,
      subject: formData.get('subject') as Subject,
      semester: (formData.get('semester') as string) || undefined,
      academicYear: (formData.get('academicYear') as string) || undefined,
      type: formData.get('type') as ResourceType,
      description: formData.get('description') as string,
      tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [],
      updatedAt: new Date().toISOString(),
    };

    if (!resourceData.title || !resourceData.author) {
      toast.error('Title and Author are required');
      return;
    }

    try {
      if (editingResource) {
        await updateDoc(doc(db, 'resources', editingResource.id), resourceData);
        toast.success('Resource updated');
      } else {
        const newResourceRef = doc(collection(db, 'resources'));
        const id = newResourceRef.id;
        await setDoc(newResourceRef, {
          ...resourceData,
          id,
          downloads: 0,
          averageRating: 0,
          ratingCount: 0,
          date: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
          fileUrl: 'https://example.com/sample.pdf', // Placeholder for admin additions
          fileType: 'PDF'
        });
        toast.success('Resource created');
      }
      setIsFormOpen(false);
      setEditingResource(null);
    } catch (e) {
      console.error('Save failed', e);
      toast.error('Save failed. Check console for details.');
    }
  };

  const stats = [
    { label: 'Total Resources', value: resources.length, icon: <FileText className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Notices', value: allNotices.length, icon: <Megaphone className="w-5 h-5" />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Registered Users', value: allUsers.length || 'Loading...', icon: <Users className="w-5 h-5" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Total Downloads', value: resources.reduce((acc, r) => acc + (r.downloads || 0), 0), icon: <Download className="w-5 h-5" />, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]">
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 shadow-sm`}>
                    {stat.icon}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity or Quick Filters */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Recent Resources
            </h2>
            <button onClick={() => setActiveTab('resources')} className="text-xs font-bold text-indigo-500 hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {resources.slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-500 transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold truncate max-w-[200px] text-slate-900 dark:text-slate-100">{r.title}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black">{r.subject}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-indigo-500">{r.downloads} DLs</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{r.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              Latest Users
            </h2>
            <button onClick={() => setActiveTab('users')} className="text-xs font-bold text-emerald-500 hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {allUsers.slice(0, 5).map(u => (
              <div key={u.id} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-emerald-500 transition-colors">
                  {u.photoURL ? <img src={u.photoURL} alt="" /> : <Users className="w-5 h-5 text-slate-400" />}
                </div>
                <div className="min-w-0 flex-grow">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{u.displayName || 'Unknown User'}</p>
                    <span className={`shrink-0 px-1 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter shadow-sm ${u.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                      {u.role || 'user'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{u.email}</p>
                </div>
              </div>
            ))}
            {allUsers.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No users found</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const [resourceFilterType, setResourceFilterType] = useState<ResourceType | 'All'>('All');
  const [resourceFilterCourse, setResourceFilterCourse] = useState<Course | 'All'>('All');

  const renderResources = () => {
    const filtered = resources.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           r.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = resourceFilterType === 'All' || r.type === resourceFilterType;
      const matchesCourse = resourceFilterCourse === 'All' || r.course === resourceFilterCourse;
      return matchesSearch && matchesType && matchesCourse;
    });

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5">
        <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>
            <select 
              value={resourceFilterType}
              onChange={(e) => setResourceFilterType(e.target.value as any)}
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="All">All Types</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select 
              value={resourceFilterCourse}
              onChange={(e) => setResourceFilterCourse(e.target.value as any)}
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="All">All Courses</option>
              {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={() => setIsFormOpen(true)} className="w-full xl:w-auto px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
            <Plus className="w-4 h-4" /> Add Resource
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-5">Resource</th>
                  <th className="px-6 py-5">Details</th>
                  <th className="px-6 py-5">Stats</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{r.title}</div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">By {r.author} • {r.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-200">{r.course}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{r.subject}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{r.downloads}</span>
                          <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase">DLs</span>
                        </div>
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                            {r.averageRating || 0} <Star className="w-2 h-2 fill-current" />
                          </span>
                          <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase">Rating</span>
                        </div>
                      </div>
                    </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditingResource(r); setIsFormOpen(true); }} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteResource(r.id)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    );
  };

  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: serverTimestamp()
      });
      toast.success(`User role updated to ${newRole}`);
      // Log the admin action
      sendNotification('admin', 'Role Changed', `Admin changed role of user ${userId} to ${newRole}`);
    } catch (e) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Delete this user? Their activity logs will remain but profile will be gone.')) {
      try {
        await deleteDoc(doc(db, 'users', id));
        toast.success('User record deleted from UI list');
      } catch (e) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: serverTimestamp()
      });
      toast.success(`User role updated to ${newRole}`);
    } catch (e) {
      toast.error('Failed to update user role');
    }
  };

  const handleClearActivity = async () => {
    if (confirm('Are you sure you want to clear the global activity log? (This will delete all notification records)')) {
      try {
        const snapshot = await getDocs(collection(db, 'notifications'));
        const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'notifications', d.id)));
        await Promise.all(deletePromises);
        toast.success('Activity log cleared');
      } catch (e) {
        toast.error('Failed to clear log');
      }
    }
  };

  const renderUsers = () => {
    const filteredUsers = allUsers.filter(u => 
      (u.displayName || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {filteredUsers.length} Users Found
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
            {filteredUsers.map(u => (
              <div key={u.id} className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 group hover:border-emerald-500/50 transition-all flex flex-col relative">
                <button 
                  onClick={() => handleDeleteUser(u.id)}
                  className="absolute top-4 right-4 p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                  title="Delete User"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full rounded-xl object-cover" /> : <Users className="w-6 h-6 text-slate-400" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 pr-6">
                      <h4 className="font-black text-slate-900 dark:text-white truncate">{u.displayName || 'Unnamed User'}</h4>
                      <span className={`shrink-0 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter shadow-sm ${u.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                        {u.role || 'user'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email}</p>
                  </div>
                </div>
                <div className="space-y-2 flex-grow">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">UID</span>
                    <span className="text-slate-600 dark:text-slate-200 font-mono truncate max-w-[150px]">{u.id}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Role</span>
                    <button 
                      onClick={() => handleToggleUserRole(u.id, u.role || 'user')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all shadow-sm active:scale-95 ${
                        u.role === 'admin' 
                          ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' 
                          : 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20'
                      }`}
                    >
                      {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Joined</span>
                    <span className="text-slate-600 dark:text-slate-200">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <button 
                    onClick={() => handleToggleAdmin(u.id, u.role)}
                    className={`flex-grow py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      u.role === 'admin'
                      ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'
                    }`}
                  >
                    {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                  </button>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <Users className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest">No users found matching your search</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderActivity = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black flex items-center gap-2">
          <History className="w-6 h-6 text-indigo-500" />
          Global Activity Log
        </h2>
        <button 
          onClick={handleClearActivity}
          className="px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        >
          Clear Log
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {globalActivity.map((act) => (
            <div key={act.id} className="p-6 flex items-start gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                act.type === 'login' ? 'bg-emerald-500/10 text-emerald-500' :
                act.type === 'logout' ? 'bg-slate-500/10 text-slate-500' :
                act.type === 'upload' ? 'bg-indigo-500/10 text-indigo-500' :
                act.type === 'download' ? 'bg-blue-500/10 text-blue-500' :
                act.type === 'admin' ? 'bg-rose-500/10 text-rose-500' :
                'bg-amber-500/10 text-amber-500'
              }`}>
                {act.type === 'login' ? <LogIn className="w-5 h-5" /> :
                 act.type === 'upload' ? <Plus className="w-5 h-5" /> :
                 act.type === 'download' ? <Download className="w-5 h-5" /> :
                 <Bell className="w-5 h-5" />}
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{act.title}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                    {act.timestamp?.toDate?.()?.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) || 'Just now'}
                  </p>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{act.message}</p>
                <p className="text-[10px] text-indigo-500/80 mt-1 font-mono uppercase tracking-tighter">ID: {act.id}</p>
              </div>
              <button 
                onClick={async () => {
                  try {
                    await deleteDoc(doc(db, 'notifications', act.id));
                    toast.success('Activity removed');
                  } catch (e) {
                    toast.error('Failed to remove');
                  }
                }}
                className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                title="Remove log entry"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {globalActivity.length === 0 && (
            <div className="py-20 text-center">
              <History className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-widest">No activity logs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderNotices = () => {
    const filteredNotices = allNotices.filter(notice => 
      notice.title.toLowerCase().includes(noticesSearchQuery.toLowerCase()) || 
      notice.message.toLowerCase().includes(noticesSearchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search notices..." 
              value={noticesSearchQuery}
              onChange={(e) => setNoticesSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotices.map(notice => (
            <div key={notice.id} className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Megaphone className="w-5 h-5" />
                </div>
                <button 
                  onClick={() => handleDeleteNotice(notice.id)}
                  className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{notice.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">{notice.message}</p>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">By {notice.name}</span>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500">
                  {notice.timestamp?.toDate?.()?.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) || notice.date}
                </span>
              </div>
            </div>
          ))}
          {filteredNotices.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <Megaphone className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
              <p className="font-black text-slate-400 uppercase tracking-widest">No active notices</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-50 dark:bg-slate-950 flex flex-col pt-16 sm:pt-0">
      {/* Sidebar / Top Nav for Admin */}
      <div className={`flex shrink-0 items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none text-slate-900 dark:text-white">Administration</h1>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Management Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-slate-100 text-slate-600'}`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={onClose}
            className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-grow flex flex-col sm:flex-row overflow-hidden">
        {/* Navigation */}
        <nav className={`w-full sm:w-64 shrink-0 border-r p-4 space-y-2 flex sm:flex-col overflow-x-auto sm:overflow-visible custom-scrollbar ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="flex sm:flex-col gap-2 min-w-max sm:min-w-0 pb-2 sm:pb-0">
            <NavButton 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
              icon={<LayoutDashboard className="w-5 h-5" />} 
              label="Overview" 
            />
            <NavButton 
              active={activeTab === 'resources'} 
              onClick={() => setActiveTab('resources')} 
              icon={<FileText className="w-5 h-5" />} 
              label="Resources" 
            />
            <NavButton 
              active={activeTab === 'notices'} 
              onClick={() => setActiveTab('notices')} 
              icon={<Megaphone className="w-5 h-5" />} 
              label="Notices" 
            />
            <NavButton 
              active={activeTab === 'users'} 
              onClick={() => setActiveTab('users')} 
              icon={<Users className="w-5 h-5" />} 
              label="User List" 
            />
            <NavButton 
              active={activeTab === 'activity'} 
              onClick={() => setActiveTab('activity')} 
              icon={<History className="w-5 h-5" />} 
              label="Activity" 
            />
          </div>
        </nav>

        {/* Content */}
        <main className="flex-grow overflow-y-auto p-4 sm:p-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto pb-20">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'resources' && renderResources()}
            {activeTab === 'notices' && renderNotices()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'activity' && renderActivity()}
          </div>
        </main>
      </div>

      {/* Resource Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] sm:rounded-[3rem] shadow-2xl p-6 sm:p-10 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} custom-scrollbar`}
            >
              <h2 className="text-2xl font-black mb-8 text-slate-900 dark:text-white">{editingResource ? 'Edit Resource' : 'Add New Resource'}</h2>
              <form onSubmit={handleSaveResource} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-2">Title</label>
                    <input name="title" defaultValue={editingResource?.title} required className="w-full px-5 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-2">Author</label>
                    <input name="author" defaultValue={editingResource?.author} required className="w-full px-5 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-2">Course</label>
                    <select value={formCourse} onChange={(e) => setFormCourse(e.target.value as any)} name="course" className="w-full px-5 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold">
                      {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-2">Branch</label>
                    <select value={formBranch} onChange={(e) => setFormBranch(e.target.value)} name="branch" className="w-full px-5 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold">
                      {COURSE_BRANCHES[formCourse].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-2">Subject</label>
                    <select name="subject" defaultValue={editingResource?.subject} className="w-full px-5 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold">
                      {formSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 block mb-2">Semester</label>
                    <select name="semester" defaultValue={editingResource?.semester} className="w-full px-5 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold">
                      <option value="">Select Semester...</option>
                      {[...Array(8)].map((_, i) => (
                        <option key={i + 1} value={`Semester ${i + 1}`}>
                          Semester {i + 1}
                        </option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 block mb-2">Academic Year</label>
                    <select name="academicYear" defaultValue={editingResource?.academicYear} className="w-full px-5 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold">
                      <option value="">Select Year...</option>
                      {["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Other"].map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 block mb-2">Type</label>
                    <select name="type" defaultValue={editingResource?.type} className="w-full px-5 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold">
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 block mb-2">Description</label>
                    <textarea name="description" defaultValue={editingResource?.description} rows={3} placeholder="Resource description..." className="w-full px-5 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold resize-none custom-scrollbar" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 block mb-2">Tags (comma separated)</label>
                    <input name="tags" defaultValue={editingResource?.tags?.join(', ')} placeholder="midterm, important, 2024" className="w-full px-5 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingResource(null);
                    }}
                    className="px-8 py-4 font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors uppercase tracking-widest text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95 transition-all">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-[2rem] font-bold text-xs sm:text-sm transition-all shrink-0 sm:shrink ${
        active 
          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 sm:-translate-y-1' 
          : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
      }`}
    >
      <div className={`transition-transform shrink-0 ${active ? 'scale-110' : ''}`}>{icon}</div>
      <span className="sm:inline">{label}</span>
    </button>
  );
}

