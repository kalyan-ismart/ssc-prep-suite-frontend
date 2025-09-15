// src/UserProfile.js
import React, { useState, useEffect } from 'react';
import api from '../apiService'; // CORRECTED IMPORT

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ fullName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        console.log('Fetching user profile...');
        
        // Fetch user profile - UPDATED API CALL
        const profileRes = await api.get('/api/users/profile/me');
        console.log('Profile response:', profileRes.data);
        
        const userData = profileRes.data.data || profileRes.data;
        setUser(userData);

        // Initialize form data
        setFormData({ 
          fullName: userData.fullName || userData.username || ''
        });

        // Fetch analytics if user data is available - UPDATED API CALL
        if (userData.id || userData._id) {
          try {
            const analyticsRes = await api.get(`/api/progress/analytics/${userData.id || userData._id}`);
            console.log('Analytics response:', analyticsRes.data);
            setAnalytics(analyticsRes.data.data || analyticsRes.data);
          } catch (analyticsErr) {
            console.warn('Analytics not available:', analyticsErr);
            // Analytics is optional, don't throw error
          }
        }

      } catch (err) {
        console.error('Failed to load profile:', err);
        setError(`Unable to load profile: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      console.log('Updating profile with:', formData);
      
      const res = await api.put(`/api/users/profile/me`, formData);
      console.log('Update response:', res.data);
      
      const updatedUser = res.data.data || res.data;
      setUser(updatedUser);
      setEditMode(false);
      setError('');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(`Failed to save changes: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCancel = () => {
    setFormData({ 
      fullName: user?.fullName || user?.username || ''
    });
    setEditMode(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="main-bg">
        <div className="modules-main-content">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="main-bg">
        <div className="modules-main-content">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error</h4>
            <p>{error}</p>
            <button 
              className="btn btn-outline-danger" 
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-bg">
      <div className="modules-main-content">
        <div className="container mt-4">
          <div className="row">
            <div className="col-md-8">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h2 className="mb-0">User Profile</h2>
                  {!editMode ? (
                    <button 
                      className="btn btn-primary"
                      onClick={() => setEditMode(true)}
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div>
                      <button 
                        className="btn btn-success me-2"
                        onClick={handleSave}
                      >
                        Save
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="card-body">
                  {error && (
                    <div className="alert alert-danger mb-3">
                      {error}
                    </div>
                  )}
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <strong>Email:</strong>
                        <p className="mb-0">{user?.email}</p>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="mb-3">
                        <strong>Username:</strong>
                        <p className="mb-0">{user?.username}</p>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="mb-3">
                        <strong>Full Name:</strong>
                        {editMode ? (
                          <input
                            type="text"
                            className="form-control"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Enter full name"
                          />
                        ) : (
                          <p className="mb-0">{user?.fullName || 'Not provided'}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="mb-3">
                        <strong>Joined:</strong>
                        <p className="mb-0">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h3 className="mb-0">Analytics</h3>
                </div>
                <div className="card-body">
                  {analytics ? (
                    <div>
                      <p><strong>Total Tests:</strong> {analytics.totalTests || 0}</p>
                      <p><strong>Average Score:</strong> {analytics.averageScore || 0}%</p>
                      <p><strong>Study Hours:</strong> {analytics.studyHours || 0}</p>
                    </div>
                  ) : (
                    <p className="text-muted">Analytics not available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}