import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, UploadCloud, File, AlertCircle, Loader2 } from "lucide-react";
import { sendNotification } from "../lib/notifications";
import {
  Course,
  COURSE_BRANCHES,
  COURSE_BRANCH_SUBJECTS,
  ResourceType,
  FileType,
} from "../data";

import { Toaster, toast } from "sonner";
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

const COURSES: Exclude<Course, "All">[] = [
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
const TYPES: Exclude<ResourceType, "All">[] = [
  "Notes",
  "Question Bank",
  "Assignment",
  "Practical",
  "PYQ",
  "Other",
];
const FILE_TYPES: Exclude<FileType, "All">[] = [
  "PDF",
  "DOCX",
  "PPTX",
  "IMAGE",
  "ZIP",
];

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (resource: any) => void;
  userName: string;
  user: any;
}

export function UploadModal({
  isOpen,
  onClose,
  onUpload,
  userName,
  user,
}: UploadModalProps) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [course, setCourse] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [academicYear, setAcademicYear] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCourse(e.target.value);
    setBranch("");
    setSubject("");
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBranch(e.target.value);
    setSubject("");
  };

  const getFileTypeFromExtension = (
    fileName: string,
  ): Exclude<FileType, "All"> => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "PDF";
    if (["doc", "docx"].includes(ext || "")) return "DOCX";
    if (["ppt", "pptx"].includes(ext || "")) return "PPTX";
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext || ""))
      return "IMAGE";
    if (["zip", "rar", "7z"].includes(ext || "")) return "ZIP";
    return "PDF"; // Default
  };

  const currentBranches =
    course && course !== "Other"
      ? COURSE_BRANCHES[course as Exclude<Course, "All">] || []
      : [];
  const currentSubjects =
    course && branch && course !== "Other"
      ? COURSE_BRANCH_SUBJECTS[course as Exclude<Course, "All">]?.[branch] || []
      : [];

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file) {
      setError("Title and File are required.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const resourceRef = doc(collection(db, "resources"));
    const fileExtension = file.name.split(".").pop();
    const storageRef = ref(
      storage,
      `resources/${resourceRef.id}_${Date.now()}.${fileExtension}`,
    );
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed", error);
        setError(`Upload failed: ${error.message || "Please check your connection"}`);
        setIsUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          const newResource = {
            id: resourceRef.id,
            title: title.trim(),
            course: course || "Other",
            branch: branch || "Other",
            subject: subject || "Other",
            semester: semester || undefined,
            academicYear: academicYear || undefined,
            type: type || "Other",
            fileType:
              fileType || (file ? getFileTypeFromExtension(file.name) : "PDF"),
            description: description.trim() || undefined,
            tags: tags
              ? tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : undefined,
            author: userName || "Anonymous",
            date: new Date().toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            downloads: 0,
            averageRating: 0,
            ratingCount: 0,
            fileUrl: downloadURL,
            timestamp: serverTimestamp(),
          };

          await onUpload(newResource);

          if (user) {
            try {
              await addDoc(collection(db, "users", user.uid, "activity"), {
                type: "upload",
                resourceId: newResource.id,
                resourceTitle: newResource.title,
                timestamp: serverTimestamp(),
              });
            } catch (actErr) {
              console.warn("Failed to log activity, but resource was uploaded", actErr);
            }
          }

          sendNotification(
            "upload",
            "New Resource Uploaded",
            `You uploaded a new ${type || "resource"}: ${title.trim()}`,
          );

          toast.success("Resource uploaded successfully!");
          setIsUploading(false);
          setUploadProgress(0);
          onClose();
          setTitle("");
          setFile(null);
          setCourse("");
          setBranch("");
          setSubject("");
          setSemester("");
          setAcademicYear("");
          setType("");
          setFileType("");
          setDescription("");
          setTags("");
          setError(null);
        } catch (err) {
          console.error("Error finalizing resource: ", err);
          setError("Upload completed but failed to register resource.");
          setIsUploading(false);
        }
      },
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 py-8 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-xl overflow-y-auto max-h-[90vh] pointer-events-auto relative z-10 flex flex-col transition-colors duration-300"
        >
          <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-6 flex items-center justify-between z-20 shrink-0 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Upload Resource
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Share your materials with everyone
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 md:col-span-2">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Complete Physics Notes 2024"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 placeholder-slate-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    File <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      required
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="w-full flex items-center gap-3 px-4 py-8 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-400 rounded-xl text-sm focus:outline-none cursor-pointer transition-colors group"
                    >
                      <div className="w-10 h-10 bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div className="flex-grow min-w-0">
                        {file ? (
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium truncate">
                              <File className="w-4 h-4 shrink-0" />
                              <span className="truncate">{file.name}</span>
                            </div>
                            <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-md shrink-0">
                              Auto-detected:{" "}
                              {getFileTypeFromExtension(file.name)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-slate-600 dark:text-slate-300 font-medium font-bold">
                              Click to select a file
                            </span>
                            <span className="text-slate-400 dark:text-slate-500 text-xs text-xs">
                              PDF, Image, Video, Document, ZIP
                            </span>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 flex justify-between">
                  Course{" "}
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-normal">
                    (Optional)
                  </span>
                </label>
                <select
                  value={course}
                  onChange={handleCourseChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 transition-colors appearance-none cursor-pointer"
                >
                  <option value="" className="dark:bg-slate-900">
                    Select Course...
                  </option>
                  {COURSES.map((c) => (
                    <option key={c} value={c} className="dark:bg-slate-900">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 flex justify-between">
                  Branch{" "}
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-normal">
                    (Optional)
                  </span>
                </label>
                <select
                  value={branch}
                  onChange={handleBranchChange}
                  disabled={!course}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 disabled:opacity-50 transition-colors appearance-none cursor-pointer"
                >
                  <option value="" className="dark:bg-slate-900">
                    Select Branch...
                  </option>
                  {currentBranches.map((b) => (
                    <option key={b} value={b} className="dark:bg-slate-900">
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 flex justify-between">
                  Subject{" "}
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-normal">
                    (Optional)
                  </span>
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={!branch}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 disabled:opacity-50 transition-colors appearance-none cursor-pointer"
                >
                  <option value="" className="dark:bg-slate-900">
                    Select Subject...
                  </option>
                  {currentSubjects.map((s) => (
                    <option key={s} value={s} className="dark:bg-slate-900">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Semester{" "}
                  <span className="text-slate-400 font-normal text-xs ml-1">
                    (Optional)
                  </span>
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 transition-colors appearance-none cursor-pointer"
                >
                  <option value="" className="dark:bg-slate-900">
                    Select Semester...
                  </option>
                  {[...Array(8)].map((_, i) => (
                    <option key={i + 1} value={`Semester ${i + 1}`} className="dark:bg-slate-900">
                      Semester {i + 1}
                    </option>
                  ))}
                  <option value="Other" className="dark:bg-slate-900">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Year{" "}
                  <span className="text-slate-400 font-normal text-xs ml-1">
                    (Optional)
                  </span>
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 transition-colors appearance-none cursor-pointer"
                >
                  <option value="" className="dark:bg-slate-900">
                    Select Academic Year...
                  </option>
                  {["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Other"].map((year) => (
                    <option key={year} value={year} className="dark:bg-slate-900">
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 flex justify-between">
                  Type{" "}
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-normal">
                    (Optional)
                  </span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 transition-colors appearance-none cursor-pointer"
                >
                  <option value="" className="dark:bg-slate-900">
                    Select Category...
                  </option>
                  {TYPES.map((t) => (
                    <option key={t} value={t} className="dark:bg-slate-900">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 flex justify-between">
                  File Format{" "}
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-normal">
                    (Optional)
                  </span>
                </label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 transition-colors appearance-none cursor-pointer"
                >
                  <option value="" className="dark:bg-slate-900">
                    Select Format...
                  </option>
                  {FILE_TYPES.map((t) => (
                    <option key={t} value={t} className="dark:bg-slate-900">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 flex justify-between">
                  Description{" "}
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-normal">
                    (Optional)
                  </span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us more about this material..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 min-h-[100px] resize-none transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 flex justify-between">
                  Tags{" "}
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-normal">
                    (Optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., midterm, important, unit1 (comma separated)"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 transition-colors placeholder-slate-500"
                />
              </div>
            </div>

            {isUploading && (
              <div className="md:col-span-2 space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">
                      Uploading to Secure Storage
                    </span>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {Math.round(uploadProgress)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  />
                </div>
                <p className="text-[9px] font-medium text-slate-400 text-center uppercase tracking-widest animate-pulse">
                  Please do not close this window
                </p>
              </div>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-2 flex justify-end gap-3 shrink-0 transition-colors">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading... {Math.round(uploadProgress)}%
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    Upload Material
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
