export const COMPANIES = [
  { id: "google", name: "Google", color: "#4285F4", accent: "#EA4335", logo: "G", vibe: "algorithmic precision and scale" },
  { id: "meta", name: "Meta", color: "#0081FB", accent: "#00C6FF", logo: "M", vibe: "social impact and rapid iteration" },
  { id: "amazon", name: "Amazon", color: "#FF9900", accent: "#146EB4", logo: "A", vibe: "customer obsession and ownership" },
  { id: "netflix", name: "Netflix", color: "#E50914", accent: "#B81D24", logo: "N", vibe: "innovation and bold decisions" },
  { id: "microsoft", name: "Microsoft", color: "#00A4EF", accent: "#7FBA00", logo: "M", vibe: "growth mindset and collaboration" },
  { id: "startup", name: "Startup", color: "#7C3AED", accent: "#A78BFA", logo: "S", vibe: "creativity and full-stack thinking" },
];

export const ROLES = [
  { id: "frontend", name: "Frontend", icon: "🎨", desc: "React, JS, CSS, HTML, Browser APIs" },
  { id: "backend", name: "Backend", icon: "⚙️", desc: "Node.js, APIs, Databases, System Design" },
  { id: "fullstack", name: "Full Stack", icon: "🌐", desc: "Frontend + Backend + Architecture" },
  { id: "dsa", name: "DSA / Problem Solving", icon: "🧠", desc: "Arrays, Trees, DP, Graphs, Sorting" },
  { id: "python", name: "Python", icon: "🐍", desc: "Python, OOP, Libraries, Data Structures" },
  { id: "java", name: "Java", icon: "☕", desc: "Java, OOP, Collections, Spring" },
  { id: "system", name: "System Design", icon: "🏗️", desc: "Architecture, Scalability, Databases" },
  { id: "behavioral", name: "Behavioral", icon: "💬", desc: "Leadership, Teamwork, Conflict Resolution" },
];

export const TOPICS = {
  frontend: ["JavaScript", "React", "CSS", "HTML", "Performance", "Accessibility", "TypeScript", "Browser APIs", "Webpack", "Testing"],
  backend: ["Node.js", "REST APIs", "GraphQL", "Databases", "Authentication", "Caching", "Microservices", "Security", "Docker", "CI/CD"],
  fullstack: ["React", "Node.js", "Databases", "APIs", "Authentication", "Deployment", "Performance", "System Design"],
  dsa: ["Arrays", "Linked Lists", "Trees", "Graphs", "Dynamic Programming", "Sorting", "Searching", "Recursion", "Hash Maps", "Stacks & Queues"],
  python: ["OOP", "Data Structures", "Libraries", "Async", "Decorators", "Testing", "FastAPI", "Django", "NumPy", "Pandas"],
  java: ["OOP", "Collections", "Multithreading", "Spring", "JVM", "Design Patterns", "Generics", "Streams", "Testing"],
  system: ["Load Balancing", "Caching", "Databases", "Microservices", "Message Queues", "CDN", "Consistency", "Availability"],
  behavioral: ["Leadership", "Conflict Resolution", "Teamwork", "Failure Stories", "Achievement", "Communication"],
};

export const LEVELS = ["Junior", "Mid-level", "Senior", "Staff"];

export const MAX_QUESTIONS = 7;

export const INTERVIEWER_PERSONAS = {
  google: "You are Alex, a senior engineer at Google. You're sharp, precise, love diving deep into fundamentals and edge cases.",
  meta: "You are Jordan, a staff engineer at Meta. You care about performance, scale, and user experience at massive scale.",
  amazon: "You are Sam, a principal engineer at Amazon. You follow leadership principles and want to see ownership mentality.",
  netflix: "You are Riley, a senior engineer at Netflix. You value innovation, bold thinking, and clean elegant code.",
  microsoft: "You are Morgan, a senior engineer at Microsoft. You value collaboration, growth mindset, and practical solutions.",
  startup: "You are Casey, CTO of a fast-growing startup. You want versatile engineers who can move fast and own things end to end.",
};

export const CODE_LANGUAGES = [
  { id: "javascript", name: "JavaScript", monaco: "javascript" },
  { id: "python", name: "Python", monaco: "python" },
  { id: "java", name: "Java", monaco: "java" },
  { id: "cpp", name: "C++", monaco: "cpp" },
  { id: "typescript", name: "TypeScript", monaco: "typescript" },
];