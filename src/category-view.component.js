import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

// ... sampleToolsData unchanged ...

export default function CategoryView({ categories, tools, apiBase }) {
  const { categoryId } = useParams();
  const [categoryData, setCategoryData] = useState(null);
  const [categoryTools, setCategoryTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ... sampleToolsData unchanged ...

  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      // Find the category from the provided categories
      const category = categories.find(cat => String(cat._id) === String(categoryId));
      if (!category) {
        setError('Category not found');
        setLoading(false);
        return;
      }
      setCategoryData(category);
      // Load sample tools for this category
      const toolsForCategory = sampleToolsData[categoryId] || [];
      const toolsWithCategory = toolsForCategory.map(tool => ({
        _id: tool.id,
        name: tool.name,
        description: tool.description,
        icon: tool.icon,
        toolType: tool.type,
        category: categoryId,
        categoryName: category.name,
        isActive: true,
        isComingSoon: false // Change this to false to allow launching
      }));
      setCategoryTools(toolsWithCategory);
      setLoading(false);
    } catch (err) {
      setError('Error loading category data');
      setLoading(false);
    }
  }, [categoryId, categories]);

  const handleToolClick = (toolId, isComingSoon) => {
    if (isComingSoon) {
      alert("This advanced tool is under development and will be available in the next update.");
    } else {
      navigate(`/tool/${toolId}`);
    }
  };

  // ... rest unchanged (render logic) ...
  // In the button:
  // onClick={() => handleToolClick(tool._id, tool.isComingSoon)}
}