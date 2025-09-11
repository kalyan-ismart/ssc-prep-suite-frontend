import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
    return (
      <div className="main-bg">
        <div className="modules-main-content">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <div style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading tool...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tool || !category) {
    return (
      <div className="main-bg">
        <div className="modules-main-content">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '3rem' }}>❌</div>
            <h2 style={{ color: '#dc2626', margin: 0 }}>Tool Not Found</h2>
            <p style={{ color: '#64748b', textAlign: 'center', maxWidth: '400px' }}>
              The requested tool could not be found. It may have been moved or doesn't exist.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Link
                to="/"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}
              >
                Back to Dashboard
              </Link>
              <button
                onClick={() => navigate(-1)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-bg">
      {/* Breadcrumb Navigation */}
      <div style={{
        padding: '1rem 5vw',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#fff'
      }}>
        <nav style={{ fontSize: '0.9rem', color: '#64748b' }}>
          <Link to="/" style={{ color: '#2563eb', textDecoration: 'none' }}>
            Dashboard
          </Link>
          <span style={{ margin: '0 0.5rem' }}>›</span>
          <span style={{ color: '#64748b' }}>{category.title}</span>
          <span style={{ margin: '0 0.5rem' }}>›</span>
          <span style={{ color: '#374151', fontWeight: '600' }}>{tool.name}</span>
        </nav>
      </div>

      <div className="modules-main-content">
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Tool Header */}
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 8px rgba(59,130,246,0.07)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
              <div style={{
                fontSize: '3rem',
                background: '#f0f9ff',
                padding: '0.75rem',
                borderRadius: '12px',
                border: '2px solid #bae6fd'
              }}>
                {category.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{
                  margin: '0 0 0.5rem 0',
                  color: '#1e293b',
                  fontSize: '2rem',
                  fontWeight: '700'
                }}>
                  {tool.name}
                </h1>
                <p style={{
                  margin: '0 0 1rem 0',
                  color: '#64748b',
                  fontSize: '1.1rem',
                  lineHeight: '1.6'
                }}>
                  {tool.description}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    borderRadius: '16px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {category.title}
                  </span>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    borderRadius: '16px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    Interactive Tool
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tool Content Area */}
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '2rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 8px rgba(59,130,246,0.07)',
            minHeight: '400px'
          }}>
            <h3 style={{
              margin: '0 0 1.5rem 0',
              color: '#1e293b',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              Tool Interface
            </h3>

            {/* Placeholder for actual tool implementation */}
            <div style={{
              border: '2px dashed #d1d5db',
              borderRadius: '12px',
              padding: '3rem 2rem',
              textAlign: 'center',
              backgroundColor: '#f9fafb'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚧</div>
              <h4 style={{
                margin: '0 0 1rem 0',
                color: '#374151',
                fontSize: '1.25rem',
                fontWeight: '600'
              }}>
                Tool Under Development
              </h4>
              <p style={{
                margin: '0 0 1.5rem 0',
                color: '#64748b',
                fontSize: '1rem',
                lineHeight: '1.6',
                maxWidth: '500px',
                margin: '0 auto 1.5rem auto'
              }}>
                This tool is currently being developed and will be available soon. 
                It will provide {tool.description.toLowerCase()}.
              </p>

              {/* Feature list */}
              <div style={{
                background: '#fff',
                borderRadius: '8px',
                padding: '1.5rem',
                margin: '1.5rem auto 0 auto',
                maxWidth: '600px',
                textAlign: 'left'
              }}>
                <h5 style={{
                  margin: '0 0 1rem 0',
                  color: '#2563eb',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  Key Features (Coming Soon):
                </h5>
                <ul style={{
                  margin: 0,
                  padding: '0 0 0 1.5rem',
                  color: '#64748b',
                  lineHeight: '1.8'
                }}>
                  <li>Interactive interface for enhanced learning</li>
                  <li>Progress tracking and analytics</li>
                  <li>Personalized recommendations</li>
                  <li>Real-time feedback and scoring</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '2rem'
          }}>
            <Link
              to="/"
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#2563eb',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                display: 'inline-block'
              }}
            >
              Back to Dashboard
            </Link>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Previous Page
            </button>
          </div>
        </div>
      </div>

      {/* Add CSS for loading animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
