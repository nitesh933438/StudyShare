import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  BookOpen,
  Search,
  Filter,
  BookText,
  FileText,
  Download,
  UserCircle,
  LogIn,
  Settings,
  Calendar,
  GraduationCap,
  LogOut,
  Users,
  Shield,
  UploadCloud,
  Moon,
  Sun,
  Bell,
  Monitor,
  User as UserIcon,
  Upload,
  X,
  ChevronRight,
  Eye,
  LayoutGrid,
  List,
  History,
  Bookmark,
  Share2,
  Info,
  Mail,
  MapPin,
  Phone,
  Github,
  Twitter,
  Linkedin,
  Heart,
  TrendingUp,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  Course,
  Branch,
  Subject,
  ResourceType,
  FileType,
  Resource,
  MOCK_RESOURCES,
  COURSE_BRANCHES,
  COURSE_BRANCH_SUBJECTS,
} from "./data";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  increment,
  addDoc,
  serverTimestamp,
  deleteDoc,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { LoginModal } from "./components/LoginModal";
import { AdminLoginModal } from "./components/AdminLoginModal";
import { AdminPanel } from "./components/AdminPanel";
import { UploadModal } from "./components/UploadModal";
import { NoticeList } from "./components/NoticeList";
import { NoticeModal } from "./components/NoticeModal";
import { NotificationDropdown } from "./components/NotificationDropdown";
import { NotificationListener } from "./components/NotificationListener";
import { HeaderActionsMenu } from "./components/HeaderActionsMenu";
import { ActivityHistoryModal } from "./components/ActivityHistoryModal";
import { BookmarksModal } from "./components/BookmarksModal";
import { AboutUsModal } from "./components/AboutUsModal";
import { ScrollToTop } from "./components/ScrollToTop";
import { RatingSystem } from "./components/RatingSystem";
import { sendNotification } from "./lib/notifications";
import { Toaster, toast } from "sonner";

const COURSES: Course[] = [
  "All",
  "B.Tech",
  "M.Tech",
  "Diploma Engineering",
  "BCA",
  "MCA",
  "BBA",
  "MBA",
  "B.Com",
  "M.Com",
  "BA",
  "MA",
  "B.Sc",
  "M.Sc",
  "LLB",
  "LLM",
  "MBBS",
  "BDS",
  "B.Pharm",
  "D.Pharm",
  "Nursing",
  "B.Ed",
  "D.El.Ed",
  "BHM",
  "BTTM",
  "BJMC",
  "BFA",
  "Fashion Designing",
];
const BRANCHES: Branch[] = ["All", "CSE", "ECE", "ME", "Civil", "IT"];
const TYPES: ResourceType[] = [
  "All",
  "Notes",
  "Question Bank",
  "Assignment",
  "Practical",
  "PYQ",
  "Other",
];
const FILE_TYPES: FileType[] = ["All", "PDF", "DOCX", "PPTX", "IMAGE", "ZIP"];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isActivityHistoryOpen, setIsActivityHistoryOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showAdminView, setShowAdminView] = useState(false);
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);

  useEffect(() => {
    const q = query(collection(db, "resources"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const fetchedResources = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Resource[];
        setResources(fetchedResources);
      } else {
        // Populate with mock data if empty
        const populateMockData = async () => {
          try {
            await Promise.all(MOCK_RESOURCES.map((resource) => 
              setDoc(doc(db, "resources", resource.id), {
                ...resource,
                averageRating: resource.averageRating || 0,
                ratingCount: resource.ratingCount || 0,
                timestamp: serverTimestamp(),
              })
            ));
          } catch (error) {
            console.error("Failed to populate mock data", error);
          }
        };
        populateMockData();
      }
    }, (error) => {
      console.error("App: Resources onSnapshot error:", error);
    });
    return () => unsubscribe();
  }, []);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      return (
        saved === "dark" ||
        (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const userRef = useRef<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const prevUser = userRef.current;
      userRef.current = currentUser;
      
      if (currentUser && !prevUser) {
        sendNotification(
          "login",
          "User logged in",
          `${currentUser.displayName || currentUser.email} has logged in.`,
        );
      }
      setUser(currentUser);

      if (currentUser) {
        // Super admin check
        if (currentUser.email === "nitesh933438@gmail.com") {
          setIsAdminMode(true);
        } else {
          // Lazy import for smaller initial bundle
          const { getDoc, doc } = await import("firebase/firestore");
          try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists() && userDoc.data().role === "admin") {
              setIsAdminMode(true);
            } else {
              setIsAdminMode(false);
            }
          } catch (err) {
            console.error("Error checking admin status", err);
            setIsAdminMode(false);
          }
        }
      } else {
        setIsAdminMode(false);
        setBookmarks([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubBookmarks = onSnapshot(
      collection(db, "users", user.uid, "bookmarks"),
      (snapshot) => {
        setBookmarks(snapshot.docs.map((doc) => doc.id));
      },
      (error) => {
        console.error("App: Bookmarks onSnapshot error:", error);
      }
    );
    return () => unsubBookmarks();
  }, [user]);

  const handleLogout = async () => {
    const email = user?.email;
    try {
      await signOut(auth);
      sendNotification("logout", "User logged out", `${email} has logged out.`);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course>("All");
  const [selectedBranch, setSelectedBranch] = useState<Branch>("All");
  const [selectedSubject, setSelectedSubject] = useState<Subject>("All");
  const [selectedType, setSelectedType] = useState<ResourceType>("All");
  const [selectedSemester, setSelectedSemester] = useState<string>("All");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("All");
  const [selectedFileType, setSelectedFileType] = useState<FileType>("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const availableSubjects = useMemo(() => {
    if (selectedCourse === "All") return ["All"];
    let subjects = new Set<string>();
    if (selectedBranch === "All") {
      const branches =
        COURSE_BRANCHES[selectedCourse as Exclude<Course, "All">];
      branches.forEach((b) => {
        COURSE_BRANCH_SUBJECTS[selectedCourse as Exclude<Course, "All">][
          b
        ]?.forEach((s) => subjects.add(s));
      });
    } else {
      COURSE_BRANCH_SUBJECTS[selectedCourse as Exclude<Course, "All">][
        selectedBranch
      ]?.forEach((s) => subjects.add(s));
    }
    return ["All", ...Array.from(subjects).sort()];
  }, [selectedCourse, selectedBranch]);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      const matchesCourse =
        selectedCourse === "All" || resource.course === selectedCourse;
      const matchesBranch =
        selectedBranch === "All" || resource.branch === selectedBranch;
      const matchesSubject =
        selectedSubject === "All" || resource.subject === selectedSubject;
      const matchesType =
        selectedType === "All" || resource.type === selectedType;
      const matchesSemester =
        selectedSemester === "All" || resource.semester === selectedSemester;
      const matchesAcademicYear =
        selectedAcademicYear === "All" || resource.academicYear === selectedAcademicYear;
      const matchesFileType =
        selectedFileType === "All" || resource.fileType === selectedFileType;

      return (
        matchesSearch &&
        matchesCourse &&
        matchesBranch &&
        matchesSubject &&
        matchesType &&
        matchesSemester &&
        matchesAcademicYear &&
        matchesFileType
      );
    }).sort((a, b) => {
      const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : new Date(a.date).getTime();
      const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : new Date(b.date).getTime();
      
      if (sortBy === "newest") {
        return timeB - timeA;
      } else {
        return timeA - timeB;
      }
    });
  }, [
    resources,
    searchQuery,
    selectedCourse,
    selectedBranch,
    selectedSubject,
    selectedType,
    selectedSemester,
    selectedAcademicYear,
    selectedFileType,
    sortBy,
  ]);

  return (
    <div
      className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}
    >
      {/* Navbar */}
      <nav
        className={`sticky top-0 z-50 border-b transition-colors duration-300 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-fuchsia-500/30 animate-pulse-glow hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span
                className={`text-lg sm:text-xl font-bold tracking-tight uppercase hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-pink-500`}
              >
                Study Portal
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 sm:p-2.5 flex items-center justify-center rounded-2xl border transition-all ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                    : "bg-white border-slate-200 text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50"
                }`}
                title="Toggle Dark Mode"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: isDarkMode ? 180 : 0 }}
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </motion.div>
              </motion.button>

              <NotificationDropdown isDarkMode={isDarkMode} />

              <HeaderActionsMenu
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                setIsNoticeModalOpen={setIsNoticeModalOpen}
                setIsUploadModalOpen={setIsUploadModalOpen}
                setIsBookmarksOpen={setIsBookmarksOpen}
                setIsAboutUsOpen={setIsAboutUsOpen}
                setIsDownloadHistoryOpen={setIsActivityHistoryOpen}
                isAdminMode={isAdminMode}
                showAdminView={showAdminView}
                setShowAdminView={setShowAdminView}
                setIsAdminModalOpen={setIsAdminModalOpen}
                setIsAdminMode={setIsAdminMode}
              />

              {user ? (
                <ProfileMenu
                  user={user}
                  onLogout={handleLogout}
                  onSwitchUser={() => setIsLoginModalOpen(true)}
                  onShowHistory={() => setIsActivityHistoryOpen(true)}
                  onShowBookmarks={() => setIsBookmarksOpen(true)}
                  onShowAboutUs={() => setIsAboutUsOpen(true)}
                  isDarkMode={isDarkMode}
                />
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-animated-gradient text-white text-sm font-semibold rounded-md shadow-lg shadow-fuchsia-500/30 transition-all flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>User Login</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Marquee Ticker */}
      <div
        className={`overflow-hidden border-b py-2.5 sm:py-3 flex items-center ${isDarkMode ? "bg-fuchsia-900/20 border-fuchsia-900/50 text-fuchsia-200" : "bg-fuchsia-50 border-fuchsia-100 text-fuchsia-700"}`}
      >
        <div className="animate-marquee font-bold text-sm flex items-center gap-12 whitespace-nowrap">
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-500 animate-pulse-glow" />{" "}
            Welcome to StudyShare! Get all your study materials here.
          </span>
          <span className="flex items-center gap-2">
            <Star
              className="w-4 h-4 text-amber-500 animate-spin"
              style={{ animationDuration: "4s" }}
            />{" "}
            "Education is the passport to the future, for tomorrow belongs to
            those who prepare for it today."
          </span>
          <span className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-emerald-500 animate-bounce" />{" "}
            Upload your notes and help the community grow!
          </span>
          <span className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-500 animate-pulse-glow" />{" "}
            Check out the trending notes to ace your exams.
          </span>
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" /> Verified resources
            shared by top students globally.
          </span>
        </div>
      </div>

      {showAdminView && isAdminMode ? (
        <AdminPanel
          resources={resources}
          setResources={setResources}
          onClose={() => setShowAdminView(false)}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow flex flex-col gap-6 w-full">
          {/* Public Notice System */}
          <NoticeList />

          {/* Header / Hero Section (hidden in bento but we keep it per rules, just styling it properly) */}
          <div className="text-center mb-8 mt-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center mb-6"
            >
              <span className={`px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] border backdrop-blur-sm transition-all hover:scale-105 ${
                isDarkMode 
                  ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                  : "bg-indigo-50/50 border-indigo-100 text-indigo-600 shadow-sm"
              }`}>
                🚀 Empowering Community Learning
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-4 transition-all bg-clip-text text-transparent bg-gradient-to-r ${
                isDarkMode 
                  ? "from-indigo-300 via-fuchsia-300 to-rose-300 drop-shadow-[0_0_30px_rgba(192,132,252,0.3)]" 
                  : "from-indigo-600 via-fuchsia-600 to-rose-600"
              }`}
            >
              Find your study materials.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-base md:text-lg max-w-2xl mx-auto transition-colors font-medium ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
            >
              Access thousands of notes, past year questions, and assignments shared by students like you.
            </motion.p>
          </div>

          {/* Search & Filters */}
          <header
            className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
          >
            <div className="flex flex-col gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search
                    className={`h-5 w-5 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                  />
                </div>
                <input
                  type="text"
                  className={`block w-full pl-11 pr-4 py-3 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode
                      ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:bg-slate-700"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white"
                  }`}
                  placeholder="Search for notes, past papers, assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <FilterSelect
                  label="Course"
                  value={selectedCourse}
                  options={COURSES}
                  isDarkMode={isDarkMode}
                  onChange={(val) => {
                    const newCourse = val as Course;
                    setSelectedCourse(newCourse);
                    if (newCourse !== "All" && selectedBranch !== "All") {
                      if (
                        !COURSE_BRANCHES[
                          newCourse as Exclude<Course, "All">
                        ].includes(selectedBranch)
                      ) {
                        setSelectedBranch("All");
                      }
                    }
                  }}
                />
                <FilterSelect
                  label="Branch"
                  value={selectedBranch}
                  options={
                    selectedCourse === "All"
                      ? ["All"]
                      : [
                          "All",
                          ...COURSE_BRANCHES[
                            selectedCourse as Exclude<Course, "All">
                          ],
                        ]
                  }
                  isDarkMode={isDarkMode}
                  onChange={(val) => setSelectedBranch(val as Branch)}
                />
                <FilterSelect
                  label="Subject"
                  value={selectedSubject}
                  options={availableSubjects}
                  isDarkMode={isDarkMode}
                  onChange={(val) => setSelectedSubject(val as Subject)}
                />
                <FilterSelect
                  label="Category"
                  value={selectedType}
                  options={TYPES}
                  isDarkMode={isDarkMode}
                  onChange={(val) => setSelectedType(val as ResourceType)}
                />
                <FilterSelect
                  label="Semester"
                  value={selectedSemester}
                  options={["All", ...[...Array(8)].map((_, i) => `Semester ${i + 1}`), "Other"]}
                  isDarkMode={isDarkMode}
                  onChange={(val) => setSelectedSemester(val)}
                />
                <FilterSelect
                  label="Academic Year"
                  value={selectedAcademicYear}
                  options={["All", "1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Other"]}
                  isDarkMode={isDarkMode}
                  onChange={(val) => setSelectedAcademicYear(val)}
                />
                <FilterSelect
                  label="File Format"
                  value={selectedFileType}
                  options={FILE_TYPES}
                  isDarkMode={isDarkMode}
                  onChange={(val) => setSelectedFileType(val as FileType)}
                />
              </div>
            </div>
          </header>

          {/* Results */}
          <div className="flex items-center justify-between mb-4">
            <h2
              className={`text-sm font-bold uppercase tracking-wider transition-colors ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              {filteredResources.length}{" "}
              {filteredResources.length === 1 ? "Result" : "Results"}
            </h2>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                Sort By:
              </span>
              <div className={`flex p-1 rounded-lg border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <button
                  onClick={() => setSortBy("newest")}
                  className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter transition-all ${
                    sortBy === "newest"
                      ? "bg-indigo-600 text-white shadow-lg"
                      : isDarkMode
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  New
                </button>
                <button
                  onClick={() => setSortBy("oldest")}
                  className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter transition-all ${
                    sortBy === "oldest"
                      ? "bg-indigo-600 text-white shadow-lg"
                      : isDarkMode
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Old
                </button>
              </div>
            </div>
          </div>

          {filteredResources.length === 0 ? (
            <div
              className={`text-center py-20 rounded-2xl border border-dashed transition-colors ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
            >
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isDarkMode ? "bg-slate-800" : "bg-slate-50"}`}
              >
                <Search
                  className={`w-8 h-8 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                />
              </div>
              <h3
                className={`text-lg font-medium mb-1 ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}
              >
                No resources found
              </h3>
              <p
                className={`${isDarkMode ? "text-slate-400" : "text-slate-500"} max-w-sm mx-auto`}
              >
                Try adjusting your search or filters to find what you're looking
                for.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCourse("All");
                  setSelectedBranch("All");
                  setSelectedSubject("All");
                  setSelectedType("All");
                  setSelectedFileType("All");
                }}
                className={`mt-6 text-sm font-bold px-6 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 ${
                  isDarkMode
                    ? "text-fuchsia-400 bg-fuchsia-500/10 hover:bg-fuchsia-500/20"
                    : "text-fuchsia-600 bg-fuchsia-50 hover:bg-fuchsia-100"
                }`}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <section className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-min md:auto-rows-[340px] gap-6">
              <AnimatePresence>
                {filteredResources.map((resource, idx) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    idx={idx}
                    globalDarkMode={isDarkMode}
                    user={user}
                    isBookmarked={bookmarks.includes(resource.id)}
                    onSearchTag={(tag) => setSearchQuery(tag)}
                  />
                ))}
              </AnimatePresence>
            </section>
          )}
        </main>
      )}

      <Footer
        isDarkMode={isDarkMode}
        onShowAboutUs={() => setIsAboutUsOpen(true)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={() => setIsAdminMode(true)}
      />
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={async (newResource) => {
          try {
            await setDoc(doc(db, "resources", newResource.id), newResource);
            // The local state will update via the onSnapshot listener already set up
          } catch (error) {
            console.error("Resource upload failed", error);
            // Fail safe local update if firestore fails (though rules might block it)
            setResources([newResource, ...resources]);
          }
        }}
        user={user}
        userName={user?.displayName || user?.email?.split("@")[0] || ""}
      />
      <NoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
      />
      <ActivityHistoryModal
        isOpen={isActivityHistoryOpen}
        onClose={() => setIsActivityHistoryOpen(false)}
        user={user}
        isDarkMode={isDarkMode}
      />
      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        user={user}
        isDarkMode={isDarkMode}
      />
      <AboutUsModal
        isOpen={isAboutUsOpen}
        onClose={() => setIsAboutUsOpen(false)}
        isDarkMode={isDarkMode}
      />
      <NotificationListener />
      <ScrollToTop />
      <Toaster
        theme={isDarkMode ? "dark" : "light"}
        position="top-right"
        expand={true}
        richColors
      />
    </div>
  );
}

function ProfileMenu({
  user,
  onLogout,
  onSwitchUser,
  onShowHistory,
  onShowBookmarks,
  onShowAboutUs,
  isDarkMode,
}: {
  user: User;
  onLogout: () => void;
  onSwitchUser: () => void;
  onShowHistory: () => void;
  onShowBookmarks: () => void;
  onShowAboutUs: () => void;
  isDarkMode: boolean;
}) {
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

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 pl-2 pr-4 py-1.5 text-sm font-semibold rounded-full shadow-sm transition-colors border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          isDarkMode
            ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
        }`}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || "User"}
            referrerPolicy="no-referrer"
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs uppercase ${isDarkMode ? "bg-fuchsia-500/20 text-fuchsia-400" : "bg-fuchsia-100 text-fuchsia-700"}`}
          >
            {user.displayName ? (
              user.displayName.charAt(0)
            ) : user.email ? (
              user.email.charAt(0)
            ) : (
              <UserCircle className="w-4 h-4" />
            )}
          </div>
        )}
        <span className="max-w-[100px] truncate">
          {user.displayName?.split(" ")[0] ||
            user.email?.split("@")[0] ||
            "Student"}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg border overflow-hidden z-[200] origin-top-right flex flex-col ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 shadow-fuchsia-900/20"
                : "bg-white border-slate-200 shadow-slate-200/50"
            }`}
          >
            <div
              className={`p-4 border-b flex flex-col gap-0.5 ${isDarkMode ? "border-slate-800 bg-slate-800/50" : "border-slate-100 bg-slate-50"}`}
            >
              <p
                className={`text-sm font-bold truncate ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}
              >
                {user.displayName || user.email?.split("@")[0] || "Student"}
              </p>
              <p
                className={`text-xs truncate ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}
                title={user.email || ""}
              >
                {user.email}
              </p>
            </div>
            <div className="p-2 flex flex-col gap-1">
              <motion.button
                whileHover={{
                  x: 4,
                  backgroundColor: isDarkMode
                    ? "rgba(30, 41, 59, 0.8)"
                    : "rgba(241, 245, 249, 0.8)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsOpen(false);
                  onShowBookmarks();
                }}
                className={`flex items-center gap-3 px-3 py-2 text-sm text-left rounded-lg transition-colors font-medium ${
                  isDarkMode
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                <Bookmark className="w-4 h-4 text-fuchsia-500" />
                My Bookmarks
              </motion.button>
              <motion.button
                whileHover={{
                  x: 4,
                  backgroundColor: isDarkMode
                    ? "rgba(30, 41, 59, 0.8)"
                    : "rgba(241, 245, 249, 0.8)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsOpen(false);
                  onShowHistory();
                }}
                className={`flex items-center gap-3 px-3 py-2 text-sm text-left rounded-lg transition-colors font-medium ${
                  isDarkMode
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                <History className="w-4 h-4 text-indigo-500" />
                Download History
              </motion.button>
              <motion.button
                whileHover={{
                  x: 4,
                  backgroundColor: isDarkMode
                    ? "rgba(30, 41, 59, 0.8)"
                    : "rgba(241, 245, 249, 0.8)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsOpen(false);
                  onShowAboutUs();
                }}
                className={`flex items-center gap-3 px-3 py-2 text-sm text-left rounded-lg transition-colors font-medium ${
                  isDarkMode
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                <Info className="w-4 h-4 text-emerald-500" />
                About StudyShare
              </motion.button>
              <motion.button
                whileHover={{
                  x: 4,
                  backgroundColor: isDarkMode
                    ? "rgba(30, 41, 59, 0.8)"
                    : "rgba(241, 245, 249, 0.8)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsOpen(false);
                  onSwitchUser();
                }}
                className={`flex items-center gap-3 px-3 py-2 text-sm text-left rounded-lg transition-colors font-medium ${
                  isDarkMode
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                <Users className="w-4 h-4 text-violet-500" />
                Switch account
              </motion.button>
              <div
                className={`h-px my-1 ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}
              />
              <motion.button
                whileHover={{
                  x: 4,
                  backgroundColor: isDarkMode
                    ? "rgba(239, 68, 68, 0.1)"
                    : "rgba(239, 68, 68, 0.05)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className={`flex items-center gap-3 px-3 py-2 text-sm text-left rounded-lg transition-colors font-bold ${
                  isDarkMode
                    ? "text-red-400 hover:text-red-300"
                    : "text-red-600 hover:text-red-700"
                }`}
              >
                <LogOut className="w-4 h-4" />
                Log out
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResourceCard({
  resource,
  idx,
  globalDarkMode,
  user,
  isBookmarked,
  onSearchTag,
}: {
  resource: Resource;
  idx: number;
  globalDarkMode?: boolean;
  user: User | null;
  isBookmarked: boolean;
  onSearchTag?: (tag: string) => void;
  key?: React.Key;
}) {
  // Apply dynamic spans for a bento feel based on modulo of index
  const getBentoClasses = () => {
    const mod = idx % 6;
    if (mod === 0)
      return globalDarkMode
        ? "lg:col-span-2 lg:row-span-2 bg-slate-900 text-slate-100 border-slate-800 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
        : "lg:col-span-2 lg:row-span-2 bg-white text-slate-900 border-slate-200 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"; // Large featured
    if (mod === 1)
      return "lg:col-span-1 lg:row-span-1 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 bg-animated-gradient text-white border-fuchsia-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-fuchsia-500/20 transition-all duration-300"; // Accent color
    if (mod === 2)
      return globalDarkMode
        ? "lg:col-span-1 lg:row-span-1 bg-slate-900 text-slate-100 border-slate-800 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
        : "lg:col-span-1 lg:row-span-1 bg-white text-slate-900 border-slate-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"; // Standard small
    if (mod === 3)
      return "lg:col-span-2 lg:row-span-1 bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-indigo-900 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300"; // Horizontal dark
    if (mod === 4)
      return globalDarkMode
        ? "lg:col-span-1 lg:row-span-1 bg-emerald-950 text-emerald-100 border-emerald-900/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
        : "lg:col-span-1 lg:row-span-1 bg-gradient-to-br from-emerald-500 to-teal-400 text-white border-emerald-400 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300"; // Success tint
    return globalDarkMode
      ? "lg:col-span-1 lg:row-span-1 bg-slate-900 text-slate-100 border-slate-800 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
      : "lg:col-span-1 lg:row-span-1 bg-white text-slate-900 border-slate-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"; // Standard small
  };

  const bentoClasses = getBentoClasses();
  const isDarkCard =
    bentoClasses.includes("from-violet-600") ||
    bentoClasses.includes("bg-slate-900") ||
    bentoClasses.includes("from-slate-900") ||
    bentoClasses.includes("bg-emerald-950") ||
    bentoClasses.includes("from-emerald-500");

  const handleDownload = async () => {
    try {
      if (resource.fileUrl) {
        // Create an invisible anchor tag to trigger the download
        const a = document.createElement("a");
        a.href = resource.fileUrl;
        a.target = "_blank";
        a.download = resource.title;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        toast.error("File URL is not available");
        return;
      }

      // Update download count
      await updateDoc(doc(db, "resources", resource.id), {
        downloads: increment(1),
      });

      // Record in user history if logged in
      if (user) {
        await addDoc(collection(db, "users", user.uid, "activity"), {
          type: "download",
          resourceId: resource.id,
          resourceTitle: resource.title,
          timestamp: serverTimestamp(),
        });
      }

      sendNotification(
        "download",
        "File downloaded",
        `You just downloaded "${resource.title}".`,
      );
      toast.success("Download started!");
    } catch (error) {
      console.error("Download tracking failed", error);
      toast.error("Failed to download resource");
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast.error("Log in to bookmark resources");
      return;
    }
    try {
      const bookmarkRef = doc(db, "users", user.uid, "bookmarks", resource.id);
      if (isBookmarked) {
        await deleteDoc(bookmarkRef);
        toast.success("Removed from bookmarks");
      } else {
        await setDoc(bookmarkRef, {
          resourceId: resource.id,
          resourceTitle: resource.title,
          fileUrl: resource.fileUrl || "",
          timestamp: serverTimestamp(),
        });
        toast.success("Added to bookmarks");
      }
    } catch (error) {
      console.error("Bookmark toggle failed", error);
    }
  };

  const [showShareMenu, setShowShareMenu] = useState(false);

  const getShareUrl = () => {
    // In a production app, this would be a link to a specific resource page
    // For now, we'll use the current URL with a resource ID as a parameter
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?resource=${resource.id}`;
  };

  const handleShare = async () => {
    const url = getShareUrl();
    const title = resource.title;
    const text = `Check out this study material for ${resource.subject}: ${resource.title}`;

    // Use native share if available (mobile/supported browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        toast.success("Shared successfully!");
        return;
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error);
        } else {
          return; // User cancelled
        }
      }
    }

    // Fallback to custom menu for desktop
    setShowShareMenu(!showShareMenu);
  };

  const handleShareSocial = (platform: "twitter" | "linkedin" | "whatsapp" | "facebook") => {
    const url = getShareUrl();
    const text = `Check out this study material for ${resource.subject}: ${resource.title}`;
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);

    let shareLink = "";
    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "whatsapp":
        shareLink = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
    }

    if (shareLink) {
      window.open(shareLink, "_blank", "noopener,noreferrer");
    }
    setShowShareMenu(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      toast.success("Link copied to clipboard!");
      setShowShareMenu(false);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -5,
        scale: 1.02,
        boxShadow: globalDarkMode
          ? "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)"
          : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        borderColor: isDarkCard
          ? undefined
          : globalDarkMode
            ? "#475569"
            : "#cbd5e1",
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.2,
        delay: idx * 0.05,
        scale: { type: "spring", stiffness: 300, damping: 20 },
      }}
      className={`rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative group ${bentoClasses}`}
    >
      <div className="flex-1">
        <div className="flex justify-between items-start mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${
              isDarkCard
                ? "bg-white/10 text-white border-white/20"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {resource.type}
          </span>
          {idx === 0 /* Trending badge for the first big card */ && (
            <span
              className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase transition-colors ${isDarkCard ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-700"}`}
            >
              Trending
            </span>
          )}
        </div>

        <h3
          className={`font-bold leading-tight mb-2 transition-colors ${idx % 6 === 0 ? "text-2xl md:text-3xl" : "text-xl"} ${isDarkCard ? "text-white" : "text-slate-800"}`}
        >
          {resource.title}
        </h3>

        {resource.description ? (
          <p
            className={`max-w-sm text-sm leading-relaxed mb-6 transition-colors ${isDarkCard ? "text-white/70" : "text-slate-500"}`}
          >
            {resource.description}
          </p>
        ) : idx % 6 === 0 ? (
          <p
            className={`max-w-sm text-sm leading-relaxed mb-6 transition-colors ${isDarkCard ? "text-white/70" : "text-slate-500"}`}
          >
            Perfect study material for {resource.subject} spanning across{" "}
            {resource.branch} concepts.
          </p>
        ) : null}

        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {resource.tags.map((tag, i) => (
              <span
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  onSearchTag?.(tag);
                }}
                className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                  isDarkCard
                    ? "bg-white/10 text-white/80 hover:bg-white/20"
                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 text-xs font-semibold mb-4 mt-2">
          <span
            className={`px-2 py-1 rounded-md flex items-center gap-1 border transition-colors ${
              isDarkCard
                ? "bg-white/10 text-white border-white/20"
                : "bg-slate-50 text-slate-500 border-slate-200"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            {resource.course}
          </span>
          <span
            className={`px-2 py-1 rounded-md border transition-colors ${
              isDarkCard
                ? "bg-white/10 text-white border-white/20"
                : "bg-slate-50 text-slate-500 border-slate-200"
            }`}
          >
            {resource.subject}
          </span>
          {resource.semester && (
            <span
              className={`px-2 py-1 rounded-md border transition-colors ${
                isDarkCard
                  ? "bg-white/10 text-white border-white/20"
                  : "bg-slate-50 text-slate-500 border-slate-200"
              }`}
            >
              {resource.semester}
            </span>
          )}
          {resource.academicYear && (
            <span
              className={`px-2 py-1 rounded-md border transition-colors ${
                isDarkCard
                  ? "bg-white/10 text-white border-white/20"
                  : "bg-slate-50 text-slate-500 border-slate-200"
              }`}
            >
              {resource.academicYear}
            </span>
          )}
        </div>

        <RatingSystem
          resourceId={resource.id}
          initialAverage={resource.averageRating}
          initialCount={resource.ratingCount}
          isDarkCard={isDarkCard}
          user={user}
        />
      </div>

      <div
        className={`mt-4 pt-4 border-t flex items-center justify-between transition-colors ${
          isDarkCard ? "border-white/10" : "border-slate-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-black px-2 py-0.5 rounded transition-colors ${
              isDarkCard
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {resource.fileType}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isDarkCard ? "text-white/80" : "text-slate-400"}`}
          >
            {resource.author}
          </span>
        </div>

        <div className="flex items-center gap-2 relative">
          <button
            onClick={handleShare}
            className={`p-2 rounded-lg transition-all duration-300 relative z-10 ${
              showShareMenu 
                ? "bg-indigo-500 text-white shadow-lg" 
                : isDarkCard
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showShareMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className={`absolute bottom-full right-0 mb-2 p-2 rounded-xl border shadow-2xl z-50 min-w-[180px] ${
                  globalDarkMode 
                    ? "bg-slate-900 border-slate-800" 
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleShareSocial("whatsapp")}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                      globalDarkMode ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center text-[#25D366]">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </div>
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleShareSocial("twitter")}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                      globalDarkMode ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                    Twitter
                  </button>
                  <button
                    onClick={() => handleShareSocial("facebook")}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                      globalDarkMode ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center text-[#1877F2]">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </div>
                    Facebook
                  </button>
                  <button
                    onClick={() => handleShareSocial("linkedin")}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                      globalDarkMode ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Linkedin className="w-5 h-5 text-[#0077b5]" />
                    LinkedIn
                  </button>
                  <div className={`h-px my-1 ${globalDarkMode ? "bg-slate-800" : "bg-slate-100"}`} />
                  <button
                    onClick={handleCopyLink}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                      globalDarkMode ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <FileText className="w-5 h-5 text-indigo-500" />
                    Copy Link
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-lg transition-all duration-300 ${
              isDarkCard
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            <Bookmark
              className={`w-4 h-4 ${isBookmarked ? "fill-current text-indigo-400" : ""}`}
            />
          </button>
          <button
            onClick={handleDownload}
            className={`flex items-center gap-1.5 p-2 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 ${
              isDarkCard
                ? "bg-white text-slate-900 hover:bg-slate-200 shadow-lg shadow-white/10"
                : "bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:from-violet-700 hover:to-pink-700 shadow-md shadow-pink-500/20"
            }`}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between px-1">
        <span
          className={`text-[9px] font-bold uppercase tracking-widest ${isDarkCard ? "text-white/40" : "text-slate-400"}`}
        >
          {resource.date}
        </span>
        <span
          className={`text-[9px] font-black ${isDarkCard ? "text-indigo-400" : "text-indigo-600"}`}
        >
          {resource.downloads} Downloads
        </span>
      </div>
    </motion.div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  isDarkMode,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  isDarkMode: boolean;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
      >
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-3 rounded-xl text-xs font-bold transition-all border outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20 ${
            isDarkMode
              ? "bg-slate-900 border-slate-800 text-slate-100 hover:border-slate-700 hover:bg-slate-800 focus:border-indigo-500"
              : "bg-white border-slate-200 text-slate-900 shadow-sm hover:border-slate-300 hover:bg-slate-50 focus:border-indigo-500"
          }`}
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="font-sans font-medium">
              {opt}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-50">
          <ChevronRight className="w-4 h-4 rotate-90" />
        </div>
      </div>
    </div>
  );
}

function Footer({
  isDarkMode,
  onShowAboutUs,
}: {
  isDarkMode: boolean;
  onShowAboutUs: () => void;
}) {
  return (
    <footer
      className={`py-12 md:py-20 px-6 md:px-8 border-t mt-12 md:mt-20 transition-colors relative overflow-hidden ${
        isDarkMode
          ? "bg-slate-950 border-slate-900 text-slate-400"
          : "bg-slate-50 border-slate-200 text-slate-600"
      }`}
    >
      {/* Background Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[120px] -translate-y-1/2 animate-pulse-glow" />
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] translate-y-1/2 animate-pulse-glow"
        style={{ animationDelay: "1s" }}
      />

      <div className="max-w-7xl mx-auto relative z-10 text-center md:text-left">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 md:gap-16">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-6 flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-xl shadow-fuchsia-500/20 hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span
                className={`text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r ${isDarkMode ? "from-violet-400 to-pink-400" : "from-violet-600 to-pink-600"}`}
              >
                StudyShare
              </span>
            </div>
            <p className="text-sm font-medium leading-relaxed max-w-xs mx-auto md:mx-0">
              India's leading platform for students to share and access study
              resources freely. Empowering education through community
              collaboration.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="p-2.5 rounded-xl bg-violet-500/10 hover:bg-gradient-to-r hover:from-violet-600 hover:to-pink-600 hover:text-white transition-all duration-300 transform hover:-translate-y-1 text-violet-600 dark:text-violet-400"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-xl bg-violet-500/10 hover:bg-gradient-to-r hover:from-violet-600 hover:to-pink-600 hover:text-white transition-all duration-300 transform hover:-translate-y-1 text-violet-600 dark:text-violet-400"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-xl bg-violet-500/10 hover:bg-gradient-to-r hover:from-violet-600 hover:to-pink-600 hover:text-white transition-all duration-300 transform hover:-translate-y-1 text-violet-600 dark:text-violet-400"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 md:gap-12">
            <div className="space-y-6">
              <h4
                className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
              >
                The Portal
              </h4>
              <ul className="space-y-4">
                <li>
                  <button
                    onClick={onShowAboutUs}
                    className="text-sm font-bold hover:text-indigo-600 transition-colors flex items-center justify-center md:justify-start gap-2 w-full md:w-auto"
                  >
                    <Info className="w-4 h-4" /> About StudyShare
                  </button>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm font-bold hover:text-indigo-600 transition-colors flex items-center justify-center md:justify-start gap-2"
                  >
                    <Users className="w-4 h-4" /> Community
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm font-bold hover:text-indigo-600 transition-colors flex items-center justify-center md:justify-start gap-2"
                  >
                    <Shield className="w-4 h-4" /> Safety Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm font-bold hover:text-indigo-600 transition-colors flex items-center justify-center md:justify-start gap-2"
                  >
                    <GraduationCap className="w-4 h-4" /> Student Perks
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4
                className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
              >
                Contact & Support
              </h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="mailto:nitesh933438@gmail.com"
                    className="text-sm font-bold hover:text-indigo-600 transition-colors flex items-center justify-center md:justify-start gap-2"
                  >
                    <Mail className="w-4 h-4" /> nitesh933438@gmail.com
                  </a>
                </li>
                <li>
                  <a
                    href="tel:9334387983"
                    className="text-sm font-bold hover:text-indigo-600 transition-colors flex items-center justify-center md:justify-start gap-2"
                  >
                    <Phone className="w-4 h-4" /> 9334387983
                  </a>
                </li>
                <li>
                  <div className="text-sm font-bold flex items-center justify-center md:justify-start gap-2">
                    <MapPin className="w-4 h-4" /> Kadma, Jamshedpur, India
                  </div>
                </li>
                <li className="pt-2">
                  <div
                    className={`p-4 rounded-2xl border mx-auto md:mx-0 max-w-[200px] ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">
                      Support Hours
                    </p>
                    <p className="text-xs font-bold">Mon - Sat: 9AM - 6PM</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="sm:col-span-2 md:col-span-1 space-y-6">
              <h4
                className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
              >
                Newsletter
              </h4>
              <p className="text-xs font-medium leading-relaxed opacity-80 max-w-sm mx-auto md:mx-0">
                Get monthly updates about new research papers and top shared
                materials.
              </p>
            <div className="flex flex-wrap gap-2 max-w-sm mx-auto md:mx-0">
                <input
                  type="email"
                  placeholder="name@email.com"
                  className={`flex-grow min-w-[120px] px-4 py-3 rounded-xl text-xs font-bold outline-none border transition-all ${
                    isDarkMode
                      ? "bg-slate-900 border-slate-800 focus:border-indigo-500"
                      : "bg-white border-slate-200 focus:border-indigo-500"
                  }`}
                />
                <button 
                  onClick={() => toast.success("Subscribed to newsletter!")}
                  className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 whitespace-nowrap"
                >
                  Sub
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`mt-12 md:mt-20 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-6 ${
            isDarkMode ? "border-slate-900" : "border-slate-200"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <span>© 2024 StudyShare</span>
            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-800" />
            <div className="flex flex-col items-center gap-1">
              <span className="flex items-center gap-1">
                Made with <Heart className="w-3 h-3 text-red-500 fill-current" />{" "}
                by Nitesh Kumar
              </span>
              <span className="text-[9px]">nitesh933438@gmail.com | 9334387983</span>
            </div>
          </div>

          <div className="flex gap-6 sm:gap-8">
            <a
              href="https://github.com/nitesh933438"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-600 transition-all flex items-center gap-1"
            >
              <Github className="w-3 h-3" /> GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/nitesh-kumar-3b7b4b382?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-600 transition-all flex items-center gap-1"
            >
              <Linkedin className="w-3 h-3" /> LinkedIn
            </a>
            <a
              href="#"
              className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-600 transition-all"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-600 transition-all"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-600 transition-all"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { ResourceCard, FilterSelect, Footer };
