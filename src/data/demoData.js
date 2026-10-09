export const INITIAL_DATA = {
 currentUser: { skills: [], verifiedBadges: [], stats: { skillSwaps: 0, projectsCompleted: 0, collaborations: 0 } },
 notifications: [],
 projects: [],
 skillSwaps: [],
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
  ]
};
