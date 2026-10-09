export const INITIAL_DATA = {
 currentUser: {
 name: "Alex Rivera",
 username: "@arivera",
 avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
 role: "Computer Science Major • Senior",
 university: "Stanford University",
 bio: "Passionate full-stack developer & AI enthusiast. Looking to collaborate on open-source web applications & hackathon projects!",
 xp: 2840,
 level: 7,
 levelTitle: "Skill Architect",
 verifiedBadges: ["Verified JS Pro", "React Specialist", "UI/UX Foundations"],
 skills: [
 { name: "React / Next.js", level: 90, category: "Frontend", verified: true },
 { name: "Node.js & Express", level: 85, category: "Backend", verified: true },
 { name: "Python / PyTorch", level: 75, category: "AI & Data", verified: false },
 { name: "UI/UX Design (Figma)", level: 80, category: "Design", verified: true },
 { name: "TypeScript", level: 88, category: "Frontend", verified: true },
 { name: "PostgreSQL & Prisma", level: 70, category: "Database", verified: false },
 { name: "Docker & CI/CD", level: 65, category: "DevOps", verified: false }
  ],
 targetSkills: ["Rust", "GraphQL", "Tailwind CSS Architecture", "Solidity"],
 savedProjectIds: ["proj-2"],
 settings: {
 publicProfile: true,
 allowRequests: true,
 showOnlineStatus: true,
 emailNotifs: true,
 aiTips: true,
 accentColor: "terracotta"
 },
 stats: {
 projectsCompleted: 12,
 collaborations: 8,
 skillSwaps: 15,
 endorsements: 42
 }
  },
 notifications: [
 {
 id: "notif-1", title: "Team Application Accepted!",
 message: "Elena Rostova accepted your application to join EcoPulse.",
 timestamp: "10 mins ago", read: false, type: "project"
 },
 {
 id: "notif-2", title: "New Skill Swap Request",
 message: "Priya Sharma requested a Figma ➔ Python skill swap session.",
 timestamp: "1 hour ago", read: false, type: "swap"
 },
 {
 id: "notif-3", title: "Badge Verified!",
 message: "You scored 100% on Modern JavaScript Assessment. Badge added to profile.",
 timestamp: "Yesterday", read: true, type: "badge"
 }
  ],
 resources: [
 { id: "res-1", title: "Complete Modern React & Next.js Cheatsheet 2026", category: "Notes & Guides", uploader: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150", downloads: 342, format: "PDF Document", link: "#" },
 { id: "res-2", title: "Data Structures & Algorithms Python Practice Handbook", category: "Textbooks", uploader: "Elena Rostova", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150", downloads: 512, format: "eBook PDF", link: "#" },
 { id: "res-3", title: "Figma UI/UX Component Library & Design Tokens", category: "Design System", uploader: "Priya Sharma", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150", downloads: 820, format: "Figma Kit", link: "#" }
  ],
 projects: [
 { id: "proj-1", title: "EcoPulse - AI-Powered Carbon Footprint Tracker", description: "Building an interactive mobile & web dashboard that uses Machine Learning to analyze receipt photos and compute personal carbon footprint metrics.", category: "Sustainability & AI", status: "Actively Recruiting", owner: { name: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250", school: "Stanford University" }, tags: ["Python", "React Native", "TensorFlow", "Node.js"], requiredRoles: ["UI/UX Designer", "ML Engineer", "Mobile Dev"], matchScore: 94, membersCount: 3, maxMembers: 5, deadline: "2026-11-15", difficulty: "Intermediate" },
 { id: "proj-2", title: "DevSprint - Real-Time Code Pair & Review Platform", description: "A collaborative code playground with voice chat, automated test generation via LLMs, and instant peer feedback.", category: "Developer Tools", status: "In Progress", owner: { name: "Marcus Chen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150", school: "UC Berkeley" }, tags: ["TypeScript", "WebSockets", "WebRTC", "Docker"], requiredRoles: ["Backend Engineer", "DevOps Lead"], matchScore: 88, membersCount: 2, maxMembers: 4, deadline: "2026-12-01", difficulty: "Advanced" },
 { id: "proj-3", title: "CampusConnect - Student Event & Marketplace Hub", description: "Hyper-local social platform for university campus clubs, peer book exchanges, and hackathon teammate matching.", category: "EdTech & Social", status: "Actively Recruiting", owner: { name: "Sophia Taylor", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150", school: "Harvard University" }, tags: ["React", "Tailwind CSS", "Firebase", "Figma"], requiredRoles: ["Frontend Engineer", "Product Manager", "Mobile Developer"], matchScore: 96, membersCount: 4, maxMembers: 6, deadline: "2026-10-30", difficulty: "Beginner Friendly" },
 { id: "proj-4", title: "BioVerse - Interactive 3D Anatomy Visualizer", description: "WebXR application allowing medical and biology students to inspect 3D organ models with interactive quizzes.", category: "3D & Medical EdTech", status: "Actively Recruiting", owner: { name: "David Kim", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150", school: "Johns Hopkins" }, tags: ["Three.js", "WebGL", "React", "Blender"], requiredRoles: ["3D Modeler", "Frontend WebGL Dev"], matchScore: 72, membersCount: 2, maxMembers: 5, deadline: "2026-12-20", difficulty: "Advanced" }
  ],
 skillSwaps: [
 { id: "swap-1", offeredSkill: "Figma & Design Systems", offeredLevel: "Expert", requestedSkill: "Python Data Analysis", user: { name: "Priya Sharma", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150", school: "CMU", rating: 4.9, reviewsCount: 18 }, availability: "Weekends & Evenings", description: "I have 3+ years of experience designing scalable mobile apps in Figma. Want to learn Python pandas/matplotlib for data science projects!" },
 { id: "swap-2", offeredSkill: "Rust & Systems Programming", offeredLevel: "Advanced", requestedSkill: "React / Frontend Design", user: { name: "Liam O'Connor", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150", school: "ETH Zurich", rating: 5.0, reviewsCount: 24 }, availability: "Flexible (PST)", description: "Low-level Systems pro. Happy to teach memory safety, async Rust & WebAssembly in exchange for help polishing modern React UI interfaces." },
 { id: "swap-3", offeredSkill: "Machine Learning & PyTorch", offeredLevel: "Advanced", requestedSkill: "Full-Stack Node.js Deployment", user: { name: "Zheng Wei", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150", school: "Tsinghua / Stanford Exchange", rating: 4.8, reviewsCount: 12 }, availability: "Tuesdays & Thursdays", description: "Built & fine-tuned transformer models. Looking to master backend API architecture & Docker deployment." }
  ],
 hackathons: [
 { id: "hack-1", title: "Global AI Student Hackathon 2026", organizer: "Major League Hacking (MLH)", prizePool: "$25,000", date: "October 24 - 26, 2026", countdownDays: 16, tags: ["AI/ML", "Open Innovation", "GenAI"], participants: 1420, openSquads: 48, banner: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600" },
 { id: "hack-2", title: "CleanTech University Challenge", organizer: "Green Future Alliance", prizePool: "$15,000", date: "November 10 - 12, 2026", countdownDays: 32, tags: ["Sustainability", "IoT", "Web3"], participants: 890, openSquads: 29, banner: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&q=80&w=600" }
  ],
 quizzes: [
 {
 id: "quiz-js", title: "Modern JavaScript & ES6+ Mastery", category: "Frontend Development", duration: "10 mins", questionCount: 5, badgeName: "Verified JS Pro", icon: "code",
 questions: [
 { question: "Which array method creates a new array with all elements that pass the test implemented by the provided function?", options: ["map()", "filter()", "reduce()", "forEach()"], correct: 1, explanation: "filter() calls a provided callback function once for each element in an array, constructing a new array of all values for which callback returns true." },
 { question: "What will `console.log(typeof NaN)` output in JavaScript?", options: ["'number'", "'nan'", "'undefined'", "'object'"], correct: 0, explanation: "In JavaScript, NaN (Not-a-Number) is actually a special numeric value, so its typeof is 'number'." },
 { question: "What is the key difference between `const` and `let` declarations?", options: ["const cannot be scoped inside functions", "const bindings cannot be reassigned after initialization", "let creates global variables only", "There is no difference in ES6"], correct: 1, explanation: "const creates a read-only reference to a value. It prevents re-assignment of the variable identifier." },
 { question: "What does Promise.all() resolve to when given an array of promises?", options: ["The result of the fastest promise only", "An array of results of all fulfilled promises", "A single combined string", "A boolean true/false"], correct: 1, explanation: "Promise.all() waits for all promises to resolve and yields an array of their resolution values." },
 { question: "What is the result of `0.1 + 0.2 === 0.3` in standard JavaScript?", options: ["true", "false", "TypeError", "undefined"], correct: 1, explanation: "Due to IEEE 754 floating-point precision, `0.1 + 0.2` equals `0.30000000000000004`, so strict comparison yields false." }
  ]
  },
 {
 id: "quiz-react", title: "React Architecture & Hooks Deep Dive", category: "Frontend Frameworks", duration: "8 mins", questionCount: 4, badgeName: "React Specialist", icon: "layers",
 questions: [
 { question: "When should you use the `useCallback` hook in React?", options: ["To memoize expensive mathematical computations", "To cache function instances between renders to prevent unnecessary child re-renders", "To perform side effects after DOM updates", "To declare global state variables"], correct: 1, explanation: "useCallback returns a memoized version of the callback that only changes if one of the dependencies has changed, preventing useless child component re-renders." },
 { question: "What rule must be strictly followed when calling React Hooks?", options: ["Hooks must only be called inside loops", "Hooks can be called inside conditional if-blocks", "Hooks must only be called at the top level of React function components", "Hooks must always be asynchronous"], correct: 2, explanation: "Hooks rely on render order. Calling them at the top level ensures they execute in the exact same sequence on every render." },
 { question: "What is the purpose of the `key` prop when rendering lists of elements in React?", options: ["To style individual list items", "To help React identify which items have changed, been added, or removed efficiently", "To encrypt component state", "To bind click event handlers automatically"], correct: 1, explanation: "Keys give elements a stable identity so React diffing algorithm can optimize reconciliation." },
 { question: "In React 18, what does automatic batching do?", options: ["Batches all network requests into a single GraphQL query", "Groups multiple state updates into a single re-render, regardless of where they originate", "Bundles JS files into small chunks automatically", "Deletes unused state variables"], correct: 1, explanation: "React 18 automatically batches state updates inside timeouts, promises, and native event handlers to reduce unnecessary renders." }
  ]
  },
 {
 id: "quiz-ux", title: "UI/UX & Visual Design Fundamentals", category: "Design & Research", duration: "10 mins", questionCount: 4, badgeName: "UI/UX Foundations", icon: "figma",
 questions: [
 { question: "What does the concept of 'Visual Hierarchy' refer to in UI Design?", options: ["Arranging visual elements in order of importance so users easily navigate content", "Using only dark colors at the top of a webpage", "Ensuring all buttons have the exact same size", "Hiding navigation menus behind hamburger icons"], correct: 0, explanation: "Visual hierarchy guides the user's eye across the interface by leveraging size, contrast, spacing, and typography weight." },
 { question: "According to WCAG AAA accessibility guidelines, what is the minimum contrast ratio for normal body text?", options: ["3:1", "4.5:1", "7:1", "10:1"], correct: 2, explanation: "WCAG AAA level requires a minimum contrast ratio of 7:1 for normal text and 4.5:1 for large text." },
 { question: "What is Fitts's Law in user interface design?", options: ["The time to acquire a target is a function of the distance to and size of the target", "Users spend most of their time on other websites", "The average human can hold 7 items in short-term memory", "Dark mode reduces eye strain by 50%"], correct: 0, explanation: "Fitts's Law dictates that interactive targets (like primary CTA buttons) should be large enough and placed close to the user's cursor/thumb position." },
 { question: "What is the main objective of creating User Personas during UX discovery?", options: ["To hire real actors for product promotional videos", "To create fictional representations of target users based on user research data", "To generate automated code templates for user logins", "To design logo variations"], correct: 1, explanation: "User personas synthesize user research findings into representative profiles that align team empathy and feature prioritization." }
  ]
 }
  ],
 workspaceTasks: [
 { id: "task-1", title: "Design Landing Page Wireframes", assignee: "Alex Rivera", assigneeAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150", status: "done", priority: "high", tag: "UI/UX" },
 { id: "task-2", title: "Set up WebSockets Chat Gateway", assignee: "Marcus Chen", assigneeAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150", status: "in-progress", priority: "urgent", tag: "Backend" },
 { id: "task-3", title: "Train Receipt OCR Model on PyTorch", assignee: "Elena Rostova", assigneeAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150", status: "in-progress", priority: "medium", tag: "AI/ML" },
 { id: "task-4", title: "Integrate JWT Auth & Refresh Tokens", assignee: "Priya Sharma", assigneeAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150", status: "todo", priority: "high", tag: "Security" },
 { id: "task-5", title: "Draft Hackathon Submission Video Script", assignee: "Sophia Taylor", assigneeAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150", status: "todo", priority: "low", tag: "Product" }
  ],
 workspaceMessages: [
 { id: "msg-1", sender: "Elena Rostova", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150", text: "Hey team! I just updated the dataset pipeline for EcoPulse. The accuracy hit 93.4%!", timestamp: "10:14 AM", isAi: false },
 { id: "msg-2", sender: "SkillBot (AI Assistant)", avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150", text: "⚡ Great milestone Elena! Suggestion: Remember to run bench tests against low-light receipt scans before demo day.", timestamp: "10:15 AM", isAi: true },
 { id: "msg-3", sender: "Marcus Chen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150", text: "Awesome work! I will connect the API endpoints to the React frontend UI today.", timestamp: "10:18 AM", isAi: false }
  ]
};
