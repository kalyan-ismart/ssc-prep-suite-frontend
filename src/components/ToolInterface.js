import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getToolById, getCategoryById } from "../data/categories";

export default function ToolInterface() {
  const { categoryId, toolId } = useParams();
  const navigate = useNavigate();

  const [tool, setTool] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate loading delay for better UX
    setTimeout(() => {
      try {
        const foundTool = getToolById(categoryId, toolId);
        const foundCategory = getCategoryById(categoryId);

        if (!foundTool || !foundCategory) {
          setError('Tool not found');
        } else {
          setTool(foundTool);
          setCategory(foundCategory);
        }
      } catch (err) {
        setError('Failed to load tool');
        console.error('Tool loading error:', err);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, [categoryId, toolId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <button
          style={{ marginBottom: '1rem', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          ← Back to Dashboard
        </button>
        <h2>{error}</h2>
        <p>The requested tool could not be found. It may have been moved or doesn't exist.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <button
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
        onClick={() => navigate('/')}
      >
        ← Back to Dashboard
      </button>

      <h1>{tool.name}</h1>
      <h3>Category: {category.name}</h3>

      <p>{tool.description}</p>

      <section>
        <h2>Features</h2>
        {/* Assuming tool.settings.features is an array */}
        {tool.settings && tool.settings.features && tool.settings.features.length > 0 ? (
          <ul>
            {tool.settings.features.map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>
        ) : (
          <p>This tool is currently being developed and will be available soon.</p>
        )}
      </section>

      {/* Render the interactive UI of your tool here */}
    </div>
  );
}
