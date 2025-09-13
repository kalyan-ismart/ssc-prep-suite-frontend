// src/data/categories.js
export const categories = [
  {
    id: "performance-dashboard",
    title: "Performance Dashboard",
    description: "Comprehensive tools for performance dashboard",
    icon: "📊",
    tools: [
      { id: "progress-analytics", name: "Progress Analytics", description: "Track your exam preparation progress with detailed analytics" },
      { id: "score-tracker", name: "Score Tracker", description: "Monitor test scores and performance trends" },
    ]
  },
  {
    id: "study-planning",
    title: "Study Planning",
    description: "Comprehensive tools for study planning",
    icon: "📅",
    tools: [
      { id: "study-scheduler", name: "Study Scheduler", description: "Create personalized study timetables" },
      { id: "syllabus-tracker", name: "Syllabus Tracker", description: "Track syllabus completion progress" },
    ]
  },
  {
    id: "practice-testing",
    title: "Practice & Testing",
    description: "Comprehensive tools for practice & testing",
    icon: "✍️",
    tools: [
      { id: "mock-tests", name: "Mock Tests", description: "Full-length mock examinations" },
      { id: "previous-papers", name: "Previous Year Papers", description: "Practice with past exam papers" },
    ]
  },
  {
    id: "ai-powered-tools",
    title: "AI-Powered Tools",
    description: "Comprehensive tools for ai-powered tools",
    icon: "🤖",
    tools: [
      { id: "ai-study-assistant", name: "AI Study Assistant", description: "Personalized AI study companion" },
      { id: "doubt-solver", name: "Doubt Solver", description: "AI-powered doubt resolution system" },
    ]
  },
];

// Helper function to get tool by ID
export const getToolById = (categoryId, toolId) => {
  const category = categories.find(cat => cat.id === categoryId);
  // FIXED: Safely handle cases where a category has no tools.
  return category ? (category.tools || []).find(tool => tool.id === toolId) : null;
};

// Helper function to get category by ID
export const getCategoryById = (categoryId) => {
  return categories.find(cat => cat.id === categoryId);
};

// Helper function to get all tools
export const getAllTools = () => {
  return categories.flatMap(cat => 
    // FIXED: Safely handle cases where a category has no tools.
    (cat.tools || []).map(tool => ({
      ...tool,
      categoryId: cat.id,
      categoryTitle: cat.title,
      categoryIcon: cat.icon
    }))
  );
};

