import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function UserProfile() {
  const [user, setUser] = useState({
    name: "Exam Aspirant",
    email: "user@sarkarisuccesshub.com",
    joinDate: "September 2024",
    currentStreak: 7,
    totalTests: 42,
    avgScore: 78,
    studyHours: 156,
    favoriteSubjects: ["Quantitative Aptitude", "General Awareness", "English Language"],
    targetExams: ["SSC CGL", "IBPS PO", "RRB NTPC"],
    recentActivity: [
      { date: "2024-09-11", activity: "Completed Mock Test - SSC CGL", score: 85 },
      { date: "2024-09-10", activity: "Practice Session - Quantitative Aptitude", score: 92 },
      { date: "2024-09-09", activity: "Daily Quiz - General Awareness", score: 78 },
      { date: "2024-09-08", activity: "Speed Test - English Language", score: 88 }
    ]
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    // Load user data from localStorage or API
    const savedUser = localStorage.getItem('sarkari-success-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleSaveProfile = () => {
    const updatedUser = { ...user, ...editData };
    setUser(updatedUser);
    localStorage.setItem('sarkari-success-user', JSON.stringify(updatedUser));
    setEditMode(false);
    setEditData({});
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const StatCard = ({ icon, label, value, color }) => (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 8px rgba(59,130,246,0.07)',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '2rem',
        marginBottom: '0.5rem',
        color: color
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: '2rem',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '0.25rem'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '0.9rem',
        color: '#64748b'
      }}>
        {label}
      </div>
    </div>
  );

  return (
    <div className="main-bg">
      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '1.5rem 5vw'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div>
            <h1 style={{
              margin: '0 0 0.25rem 0',
              color: '#1e293b',
              fontSize: '2rem',
              fontWeight: '700'
            }}>
              User Profile
            </h1>
            <nav style={{ fontSize: '0.9rem', color: '#64748b' }}>
              <Link to="/" style={{ color: '#2563eb', textDecoration: 'none' }}>
                Dashboard
              </Link>
              <span style={{ margin: '0 0.5rem' }}>›</span>
              <span>Profile</span>
            </nav>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: editMode ? '#dc2626' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {editMode ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="modules-main-content">
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Profile Header */}
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 8px rgba(59,130,246,0.07)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                color: 'white',
                fontWeight: '700'
              }}>
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                {editMode ? (
                  <input
                    type="text"
                    value={editData.name || user.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      border: '2px solid #2563eb',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      marginBottom: '0.5rem',
                      width: '300px'
                    }}
                  />
                ) : (
                  <h2 style={{
                    margin: '0 0 0.5rem 0',
                    color: '#1e293b',
                    fontSize: '1.75rem',
                    fontWeight: '700'
                  }}>
                    {user.name}
                  </h2>
                )}
                
                {editMode ? (
                  <input
                    type="email"
                    value={editData.email || user.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    style={{
                      fontSize: '1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      marginBottom: '0.5rem',
                      width: '300px'
                    }}
                  />
                ) : (
                  <p style={{
                    margin: '0 0 0.5rem 0',
                    color: '#64748b',
                    fontSize: '1rem'
                  }}>
                    {user.email}
                  </p>
                )}
                
                <p style={{
                  margin: 0,
                  color: '#64748b',
                  fontSize: '0.9rem'
                }}>
                  Member since {user.joinDate}
                </p>
              </div>
              
              {editMode && (
                <button
                  onClick={handleSaveProfile}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <StatCard
              icon="🔥"
              label="Current Streak"
              value={`${user.currentStreak} days`}
              color="#f59e0b"
            />
            <StatCard
              icon="📝"
              label="Tests Completed"
              value={user.totalTests}
              color="#3b82f6"
            />
            <StatCard
              icon="📊"
              label="Average Score"
              value={`${user.avgScore}%`}
              color="#10b981"
            />
            <StatCard
              icon="⏰"
              label="Study Hours"
              value={`${user.studyHours}h`}
              color="#8b5cf6"
            />
          </div>

          {/* Tab Navigation */}
          <div style={{
            background: '#fff',
            borderRadius: '16px 16px 0 0',
            border: '1px solid #e5e7eb',
            borderBottom: 'none'
          }}>
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #e5e7eb'
            }}>
              {['overview', 'activity', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '1rem 2rem',
                    border: 'none',
                    background: activeTab === tab ? '#f8fafc' : 'transparent',
                    color: activeTab === tab ? '#2563eb' : '#64748b',
                    fontWeight: activeTab === tab ? '600' : '400',
                    borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    fontSize: '1rem'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div style={{
            background: '#fff',
            borderRadius: '0 0 16px 16px',
            border: '1px solid #e5e7eb',
            borderTop: 'none',
            padding: '2rem',
            minHeight: '400px'
          }}>
            {activeTab === 'overview' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Favorite Subjects</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {user.favoriteSubjects.map((subject, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '0.75rem 1rem',
                            background: '#f1f5f9',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          {subject}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Target Exams</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {user.targetExams.map((exam, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '0.75rem 1rem',
                            background: '#ecfdf5',
                            borderRadius: '8px',
                            border: '1px solid #bbf7d0',
                            color: '#166534',
                            fontWeight: '600'
                          }}
                        >
                          {exam}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {user.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                          {activity.activity}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {activity.date}
                        </div>
                      </div>
                      <div style={{
                        padding: '0.5rem 1rem',
                        background: activity.score >= 80 ? '#dcfce7' : activity.score >= 60 ? '#fef3c7' : '#fee2e2',
                        color: activity.score >= 80 ? '#166534' : activity.score >= 60 ? '#d97706' : '#dc2626',
                        borderRadius: '20px',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                      }}>
                        {activity.score}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>Account Settings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                      Email Notifications
                    </label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" defaultChecked />
                        Daily reminders
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" defaultChecked />
                        Test results
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" />
                        Weekly reports
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                      Study Reminders
                    </label>
                    <select style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '1rem',
                      width: '200px'
                    }}>
                      <option value="daily">Daily</option>
                      <option value="weekdays">Weekdays only</option>
                      <option value="custom">Custom schedule</option>
                      <option value="off">Off</option>
                    </select>
                  </div>

                  <div>
                    <button style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}>
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
