// categories.js - Data structure for all categories and tools
export const categories = [
  {
    id: "performance-dashboard",
    title: "Performance Dashboard",
    description: "Comprehensive tools for performance dashboard",
    icon: "📊",
    totalTools: 6,
    tools: [
      { id: "progress-analytics", name: "Progress Analytics", description: "Track your exam preparation progress with detailed analytics" },
      { id: "score-tracker", name: "Score Tracker", description: "Monitor test scores and performance trends" },
      { id: "streak-counter", name: "Streak Counter", description: "Track daily study streaks and consistency" },
      { id: "performance-comparison", name: "Performance Comparison", description: "Compare your performance with peers" },
      { id: "weakness-identifier", name: "Weakness Identifier", description: "Identify and focus on weak areas" },
      { id: "goal-achievement", name: "Goal Achievement", description: "Set and track preparation goals" }
    ]
  },
  {
    id: "study-planning",
    title: "Study Planning",
    description: "Comprehensive tools for study planning",
    icon: "📅",
    totalTools: 8,
    tools: [
      { id: "study-scheduler", name: "Study Scheduler", description: "Create personalized study timetables" },
      { id: "syllabus-tracker", name: "Syllabus Tracker", description: "Track syllabus completion progress" },
      { id: "revision-planner", name: "Revision Planner", description: "Plan and schedule revision sessions" },
      { id: "time-management", name: "Time Management", description: "Optimize study time allocation" },
      { id: "milestone-setter", name: "Milestone Setter", description: "Set and track study milestones" },
      { id: "calendar-integration", name: "Calendar Integration", description: "Sync with calendar apps" },
      { id: "study-groups", name: "Study Groups", description: "Join and create study groups" },
      { id: "resource-organizer", name: "Resource Organizer", description: "Organize study materials efficiently" }
    ]
  },
  {
    id: "practice-testing",
    title: "Practice & Testing",
    description: "Comprehensive tools for practice & testing",
    icon: "✍️",
    totalTools: 8,
    tools: [
      { id: "mock-tests", name: "Mock Tests", description: "Full-length mock examinations" },
      { id: "chapter-tests", name: "Chapter-wise Tests", description: "Subject-specific chapter tests" },
      { id: "previous-papers", name: "Previous Year Papers", description: "Practice with past exam papers" },
      { id: "daily-quizzes", name: "Daily Quizzes", description: "Short daily practice quizzes" },
      { id: "speed-tests", name: "Speed Tests", description: "Improve solving speed and accuracy" },
      { id: "sectional-tests", name: "Sectional Tests", description: "Section-specific practice tests" },
      { id: "adaptive-testing", name: "Adaptive Testing", description: "AI-powered adaptive test system" },
      { id: "test-analysis", name: "Test Analysis", description: "Detailed test performance analysis" }
    ]
  },
  {
    id: "subject-mastery",
    title: "Subject Mastery",
    description: "Comprehensive tools for subject mastery",
    icon: "📚",
    totalTools: 8,
    tools: [
      { id: "quantitative-aptitude", name: "Quantitative Aptitude", description: "Mathematics and numerical ability" },
      { id: "reasoning-ability", name: "Reasoning Ability", description: "Logical and analytical reasoning" },
      { id: "general-awareness", name: "General Awareness", description: "Current affairs and general knowledge" },
      { id: "english-language", name: "English Language", description: "Grammar, vocabulary, and comprehension" },
      { id: "computer-knowledge", name: "Computer Knowledge", description: "Basic computer and IT concepts" },
      { id: "banking-awareness", name: "Banking Awareness", description: "Banking sector knowledge" },
      { id: "economic-awareness", name: "Economic Awareness", description: "Economic concepts and current trends" },
      { id: "legal-knowledge", name: "Legal Knowledge", description: "Legal awareness and constitution" }
    ]
  },
  {
    id: "ai-powered-tools",
    title: "AI-Powered Tools",
    description: "Comprehensive tools for ai-powered tools",
    icon: "🤖",
    totalTools: 8,
    tools: [
      { id: "ai-study-assistant", name: "AI Study Assistant", description: "Personalized AI study companion" },
      { id: "doubt-solver", name: "Doubt Solver", description: "AI-powered doubt resolution system" },
      { id: "question-generator", name: "Question Generator", description: "Generate practice questions using AI" },
      { id: "performance-predictor", name: "Performance Predictor", description: "Predict exam performance using AI" },
      { id: "study-recommendation", name: "Study Recommendation", description: "AI-based study recommendations" },
      { id: "content-summarizer", name: "Content Summarizer", description: "Auto-summarize study materials" },
      { id: "smart-flashcards", name: "Smart Flashcards", description: "AI-generated smart flashcards" },
      { id: "voice-assistant", name: "Voice Assistant", description: "Voice-based study assistant" }
    ]
  },
  {
    id: "exam-specific-prep",
    title: "Exam-Specific Prep",
    description: "Comprehensive tools for exam-specific prep",
    icon: "🎓",
    totalTools: 8,
    tools: [
      { id: "upsc-preparation", name: "UPSC Preparation Hub", description: "Comprehensive UPSC resources and materials" },
      { id: "ssc-cgl-toolkit", name: "SSC CGL Toolkit", description: "Specialized SSC CGL preparation tools" },
      { id: "banking-exam-center", name: "Banking Exam Center", description: "Banking sector specific preparation" },
      { id: "railway-exam-resources", name: "Railway Exam Resources", description: "Technical railway exam preparation" },
      { id: "state-psc-preparation", name: "State PSC Preparation", description: "State-wise PSC exam resources" },
      { id: "defense-exam-prep", name: "Defense Exam Prep", description: "Military and defense exam preparation" },
      // FIXED: Corrected the id:: typo below
      { id: "teaching-exam-resources", name: "Teaching Exam Resources", description: "Education sector job preparation" },
      { id: "police-exam-preparation", name: "Police Exam Preparation", description: "Law enforcement exam resources" }
    ]
  }
];

// Helper function to get tool by ID
export const getToolById = (categoryId, toolId) => {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.tools.find(tool => tool.id === toolId) : null;
};

// Helper function to get category by ID
export const getCategoryById = (categoryId) => {
  return categories.find(cat => cat.id === categoryId);
};

// Helper function to get all tools
export const getAllTools = () => {
  return categories.flatMap(cat => 
    cat.tools.map(tool => ({
      ...tool,
      categoryId: cat.id,
      categoryTitle: cat.title,
      categoryIcon: cat.icon
    }))
  );
};

export default categories;