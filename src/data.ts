export type Course = 'All' | 'B.Tech' | 'M.Tech' | 'Diploma Engineering' | 'BCA' | 'MCA' | 'BBA' | 'MBA' | 'B.Com' | 'M.Com' | 'BA' | 'MA' | 'B.Sc' | 'M.Sc' | 'LLB' | 'LLM' | 'MBBS' | 'BDS' | 'B.Pharm' | 'D.Pharm' | 'Nursing' | 'B.Ed' | 'D.El.Ed' | 'BHM' | 'BTTM' | 'BJMC' | 'BFA' | 'Fashion Designing';
export type Branch = string;
export type Subject = string;
export type ResourceType = 'All' | 'Notes' | 'Question Bank' | 'Assignment' | 'Practical' | 'PYQ' | 'Other';
export type FileType = 'All' | 'PDF' | 'DOCX' | 'PPTX' | 'IMAGE' | 'ZIP';

export const COURSE_BRANCHES: Record<Exclude<Course, 'All'>, string[]> = {
  'B.Tech': ['CSE', 'IT', 'Mechanical', 'Civil', 'Electrical', 'ECE', 'AI & Data Science', 'Cyber Security'],
  'M.Tech': ['CSE', 'IT', 'Mechanical', 'Civil', 'Electrical', 'ECE', 'AI & Data Science', 'Cyber Security'],
  'Diploma Engineering': ['CSE', 'Mechanical', 'Civil', 'Electrical', 'Electronics'],
  'BCA': ['General', 'Data Science', 'AI'],
  'MCA': ['General', 'Data Science', 'AI'],
  'BBA': ['General', 'Marketing', 'Finance', 'HR', 'International Business'],
  'MBA': ['General', 'Marketing', 'Finance', 'HR', 'International Business'],
  'B.Com': ['General', 'Accounting & Finance', 'Banking & Insurance'],
  'M.Com': ['General', 'Accounting & Finance', 'Banking & Insurance'],
  'B.Sc': ['Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Biotechnology', 'Microbiology'],
  'M.Sc': ['Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Biotechnology', 'Microbiology'],
  'BA': ['English', 'Hindi', 'History', 'Political Science', 'Sociology', 'Psychology', 'Economics'],
  'MA': ['English', 'Hindi', 'History', 'Political Science', 'Sociology', 'Psychology', 'Economics'],
  'LLB': ['Corporate Law', 'Criminal Law', 'Constitutional Law'],
  'LLM': ['Corporate Law', 'Criminal Law', 'Constitutional Law'],
  'MBBS': ['General Medicine', 'Surgery', 'Pediatrics'],
  'BDS': ['Dental Surgery', 'Orthodontics'],
  'B.Pharm': ['Pharmaceutics', 'Pharmacology', 'Pharmaceutical Chemistry'],
  'D.Pharm': ['Pharmaceutics', 'Pharmacology', 'Pharmaceutical Chemistry'],
  'Nursing': ['General', 'Nursing', 'Midwifery'],
  'B.Ed': ['General Education', 'Primary Education'],
  'D.El.Ed': ['General Education', 'Primary Education'],
  'BHM': ['Hotel Management', 'Hospitality'],
  'BTTM': ['Travel & Tourism', 'Tourism Management'],
  'BJMC': ['Journalism', 'Mass Communication', 'Digital Media'],
  'BFA': ['Painting', 'Sculpture', 'Applied Arts'],
  'Fashion Designing': ['Fashion Design', 'Textile Design']
};

export const COURSE_BRANCH_SUBJECTS: Record<Exclude<Course, 'All'>, Record<string, string[]>> = {
  'B.Tech': {
    'CSE': ['Programming in C', 'Data Structures', 'Algorithms', 'DBMS', 'Operating System', 'Computer Networks', 'Software Engineering', 'Web Development', 'AI', 'Machine Learning', 'Cyber Security', 'Cloud Computing'],
    'IT': ['Programming', 'DBMS', 'Networking', 'Web Development', 'Cyber Security'],
    'Mechanical': ['Engineering Mechanics', 'Thermodynamics', 'Fluid Mechanics', 'Strength of Materials', 'Machine Design', 'Manufacturing Process', 'Heat Transfer'],
    'Civil': ['Structural Engineering', 'Geotechnical Engineering', 'Surveying', 'Environmental Engineering', 'Transportation Engineering'],
    'Electrical': ['Circuit Theory', 'Electrical Machines', 'Power Systems', 'Control Systems', 'Power Electronics'],
    'ECE': ['Digital Electronics', 'Analog Circuits', 'Signals & Systems', 'Communication Systems', 'VLSI'],
    'AI & Data Science': ['Machine Learning', 'Deep Learning', 'Data Visualization', 'Big Data'],
    'Cyber Security': ['Network Security', 'Cryptography', 'Ethical Hacking']
  },
  'M.Tech': {
    'CSE': ['Advanced Algorithms', 'Distributed Systems', 'Advanced DBMS'],
    'IT': ['Advanced Networking', 'Information Security'],
    'Mechanical': ['Advanced Thermodynamics', 'Robotics'],
    'Civil': ['Advanced Structural Analysis', 'Construction Management'],
    'Electrical': ['Advanced Power Systems', 'Smart Grids'],
    'ECE': ['Advanced VLSI', 'Wireless Communication'],
    'AI & Data Science': ['Advanced AI', 'Natural Language Processing'],
    'Cyber Security': ['Advanced Cryptography', 'Cyber Forensics']
  },
  'Diploma Engineering': {
    'CSE': ['Programming in C', 'Data Structures', 'Algorithms', 'DBMS', 'Operating System', 'Computer Networks', 'Software Engineering', 'Web Development', 'AI', 'Machine Learning', 'Cyber Security', 'Cloud Computing'],
    'Mechanical': ['Engineering Mechanics', 'Thermodynamics', 'Fluid Mechanics', 'Strength of Materials', 'Machine Design', 'Manufacturing Process', 'Heat Transfer'],
    'Civil': ['Structural Engineering', 'Geotechnical Engineering', 'Surveying', 'Environmental Engineering', 'Transportation Engineering'],
    'Electrical': ['Circuit Theory', 'Electrical Machines', 'Power Systems', 'Control Systems', 'Power Electronics'],
    'Electronics': ['Digital Electronics', 'Analog Circuits']
  },
  'BCA': {
    'General': ['C Programming', 'Data Structures', 'DBMS', 'Operating System', 'Computer Networks', 'Java', 'Python', 'Web Development', 'Software Engineering'],
    'Data Science': ['Python', 'Statistics', 'Machine Learning'],
    'AI': ['Python', 'AI Principles', 'Machine Learning']
  },
  'MCA': {
    'General': ['Advanced Programming', 'Data Structures', 'DBMS', 'AI', 'Machine Learning', 'Cloud Computing', 'Cyber Security'],
    'Data Science': ['Advanced Data Science', 'Big Data Analytics'],
    'AI': ['Deep Learning', 'Advanced AI']
  },
  'BBA': {
    'General': ['Principles of Management', 'Marketing', 'Finance', 'HR', 'Business Law', 'Accounting', 'Economics', 'Entrepreneurship'],
    'Marketing': ['Marketing Management', 'Consumer Behavior', 'Digital Marketing'],
    'Finance': ['Financial Management', 'Investment', 'Banking'],
    'HR': ['Human Resource Management', 'Organizational Behavior'],
    'International Business': ['Global Trade', 'International Marketing']
  },
  'MBA': {
    'General': ['Management', 'Communication', 'Economics'],
    'Marketing': ['Marketing Management', 'Consumer Behavior', 'Digital Marketing'],
    'Finance': ['Financial Management', 'Investment', 'Banking'],
    'HR': ['Human Resource Management', 'Organizational Behavior'],
    'International Business': ['Global Strategy', 'International Finance']
  },
  'B.Com': {
    'General': ['Financial Accounting', 'Cost Accounting', 'Business Law', 'Taxation', 'Auditing', 'Economics', 'Banking'],
    'Accounting & Finance': ['Advanced Accounting', 'Financial Management'],
    'Banking & Insurance': ['Banking Law', 'Insurance Principles']
  },
  'M.Com': {
    'General': ['Financial Accounting', 'Cost Accounting', 'Business Law', 'Taxation', 'Auditing', 'Economics', 'Banking'],
    'Accounting & Finance': ['Advanced Accounting', 'Financial Management'],
    'Banking & Insurance': ['Banking Law', 'Insurance Principles']
  },
  'B.Sc': {
    'Physics': ['Mechanics', 'Thermodynamics', 'Optics', 'Quantum Physics'],
    'Chemistry': ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry'],
    'Mathematics': ['Algebra', 'Calculus', 'Statistics'],
    'Computer Science': ['Programming', 'DBMS', 'OS'],
    'Biotechnology': ['Genetics', 'Microbiology', 'Bioinformatics'],
    'Microbiology': ['General Microbiology', 'Immunology']
  },
  'M.Sc': {
    'Physics': ['Advanced Mechanics', 'Advanced Quantum Physics'],
    'Chemistry': ['Advanced Organic Chemistry', 'Advanced Physical Chemistry'],
    'Mathematics': ['Advanced Algebra', 'Advanced Calculus'],
    'Computer Science': ['Advanced Programming', 'Advanced DBMS'],
    'Biotechnology': ['Advanced Genetics', 'Advanced Bioinformatics'],
    'Microbiology': ['Advanced Immunology']
  },
  'BA': {
    'English': ['Literature', 'Grammar'],
    'Hindi': ['Hindi Literature', 'Vyakaran'],
    'History': ['Ancient History', 'Medieval History', 'Modern History'],
    'Political Science': ['Indian Politics', 'International Relations'],
    'Sociology': ['Social Theories'],
    'Psychology': ['Cognitive Psychology', 'Clinical Psychology'],
    'Economics': ['Micro Economics', 'Macro Economics']
  },
  'MA': {
    'English': ['Advanced Literature'],
    'Hindi': ['Advanced Hindi Literature'],
    'History': ['Historiography'],
    'Political Science': ['Advanced International Relations'],
    'Sociology': ['Advanced Social Theories'],
    'Psychology': ['Advanced Clinical Psychology'],
    'Economics': ['Advanced Micro Economics']
  },
  'LLB': {
    'Corporate Law': ['Corporate Law', 'Contract Law'],
    'Criminal Law': ['Criminal Law', 'Evidence Act'],
    'Constitutional Law': ['Constitutional Law', 'Family Law']
  },
  'LLM': {
    'Corporate Law': ['Advanced Corporate Law'],
    'Criminal Law': ['Advanced Criminal Law'],
    'Constitutional Law': ['Advanced Constitutional Law']
  },
  'MBBS': {
    'General Medicine': ['Anatomy', 'Physiology', 'Biochemistry', 'Pharmacology', 'Pathology', 'Microbiology'],
    'Surgery': ['General Surgery'],
    'Pediatrics': ['Pediatrics']
  },
  'BDS': {
    'Dental Surgery': ['Dental Anatomy', 'Oral Surgery'],
    'Orthodontics': ['Orthodontics']
  },
  'B.Pharm': {
    'Pharmaceutics': ['Pharmaceutics', 'Pharmacology', 'Pharmaceutical Chemistry'],
    'Pharmacology': ['Pharmacology'],
    'Pharmaceutical Chemistry': ['Pharmaceutical Chemistry']
  },
  'D.Pharm': {
    'Pharmaceutics': ['Basic Pharmaceutics', 'Basic Pharmacology', 'Basic Pharmaceutical Chemistry'],
    'Pharmacology': ['Basic Pharmacology'],
    'Pharmaceutical Chemistry': ['Basic Pharmaceutical Chemistry']
  },
  'Nursing': {
    'General': ['Anatomy', 'Nursing Care', 'Community Health'],
    'Nursing': ['Advanced Nursing Care'],
    'Midwifery': ['Midwifery']
  },
  'B.Ed': {
    'General Education': ['Teaching Methods', 'Child Psychology', 'Education Philosophy'],
    'Primary Education': ['Primary Teaching Methods']
  },
  'D.El.Ed': {
    'General Education': ['Primary Teaching', 'Child Development'],
    'Primary Education': ['Primary Teaching', 'Child Development']
  },
  'BHM': {
    'Hotel Management': ['Food Production', 'Hospitality Management'],
    'Hospitality': ['Hospitality Management']
  },
  'BTTM': {
    'Travel & Tourism': ['Travel Management', 'Tourism'],
    'Tourism Management': ['Tourism Management']
  },
  'BJMC': {
    'Journalism': ['Journalism', 'Media Studies', 'Digital Media'],
    'Mass Communication': ['Mass Communication'],
    'Digital Media': ['Digital Media']
  },
  'BFA': {
    'Painting': ['Drawing', 'Painting', 'Sculpture'],
    'Sculpture': ['Sculpture'],
    'Applied Arts': ['Applied Arts']
  },
  'Fashion Designing': {
    'Fashion Design': ['Fashion Design', 'Textile Design'],
    'Textile Design': ['Textile Design']
  }
};

export interface Resource {
  id: string;
  title: string;
  course: Exclude<Course, 'All'> | 'Other';
  branch: string;
  subject: string;
  type: string;
  semester?: string;
  academicYear?: string;
  author: string;
  date: string;
  downloads: number;
  fileType: Exclude<FileType, 'All'>;
  timestamp?: any;
  averageRating?: number;
  ratingCount?: number;
  description?: string;
  tags?: string[];
  fileUrl?: string;
}

export interface Notice {
  id: string;
  title: string;
  message: string;
  name: string;
  timestamp: any;
}

export interface Notification {
  id: string;
  type: 'login' | 'logout' | 'upload' | 'download' | 'notice' | 'admin';
  title: string;
  message: string;
  timestamp: any;
  read?: boolean;
}

export const MOCK_RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'Operating Systems Mid-Term PYQ 2023',
    course: 'B.Tech',
    branch: 'CSE',
    subject: 'Operating Systems',
    type: 'PYQ',
    author: 'Prof. Smith',
    date: 'Oct 12, 2023, 10:30 AM',
    downloads: 142,
    fileType: 'PDF'
  },
  {
    id: '2',
    title: 'Advanced Database Normalization Notes',
    course: 'M.Tech',
    branch: 'IT',
    subject: 'Database',
    type: 'Notes',
    author: 'Dr. Alan',
    date: 'Nov 05, 2023, 02:15 PM',
    downloads: 87,
    fileType: 'DOCX'
  },
  {
    id: '3',
    title: 'Data Structures Lab Assignments 1-5',
    course: 'BCA',
    branch: 'CSE',
    subject: 'Data Structures',
    type: 'Assignment',
    author: 'T.A. Jane',
    date: 'Sep 20, 2023, 09:00 AM',
    downloads: 305,
    fileType: 'ZIP'
  },
  {
    id: '4',
    title: 'Computer Networks Top 50 Questions',
    course: 'B.Tech',
    branch: 'ECE',
    subject: 'Computer Networks',
    type: 'Question Bank',
    author: 'Network Dept',
    date: 'Dec 01, 2023, 11:45 AM',
    downloads: 412,
    fileType: 'PDF'
  },
  {
    id: '5',
    title: 'Engineering Mathematics Formula Sheet',
    course: 'B.Tech',
    branch: 'Civil',
    subject: 'Mathematics',
    type: 'Notes',
    author: 'Prof. Gauss',
    date: 'Aug 15, 2023, 01:20 PM',
    downloads: 520,
    fileType: 'IMAGE'
  },
  {
    id: '6',
    title: 'UI/UX Heuristics Evaluation Practical',
    course: 'MCA',
    branch: 'IT',
    subject: 'UI/UX',
    type: 'Practical',
    author: 'Dr. Design',
    date: 'Jan 10, 2024, 04:30 PM',
    downloads: 64,
    fileType: 'PPTX'
  },
  {
    id: '7',
    title: 'Civil Engineering Semester 3 PYQ',
    course: 'B.Tech',
    branch: 'Civil',
    subject: 'Other',
    type: 'PYQ',
    author: 'Exam Cell',
    date: 'Feb 12, 2024, 08:30 AM',
    downloads: 120,
    fileType: 'PDF'
  },
  {
    id: '8',
    title: 'Database Schema Design Examples',
    course: 'B.Tech',
    branch: 'CSE',
    subject: 'Database',
    type: 'Notes',
    author: 'Prof. Codd',
    date: 'Mar 01, 2024, 03:00 PM',
    downloads: 245,
    fileType: 'IMAGE'
  }
];
