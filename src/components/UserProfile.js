// src/UserProfile.js

import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile, getAnalytics } from './services/api';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ fullName: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user profile
        const profileRes = await getProfile();
        const userData = profileRes.data;
        setUser(userData);

        // Fetch analytics
        const analyticsRes = await getAnalytics(userData.id);
        setAnalytics(analyticsRes.data.data);

        // Initialize form
        setFormData({ fullName: userData.fullName });
      } catch (err) {
        console.error('Failed to load profile or analytics', err);
        setError('Unable to load profile.');
      }
    }
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await updateProfile(user.id, formData);
      setUser(res.data.data);
      setEditMode(false);
    } catch (err) {
      console.error('Failed to update profile', err);
      setError('Failed to save changes.');
    }
  };

  if (error) return <div className="error">{error}</div>;
  if (!user || !analytics) return <div>Loading...</div>;

  return (
    <div className="user-profile">
      {editMode ? (
        <div className="profile-edit">
          <label>
            Full Name:
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />
          </label>
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEditMode(false)}>Cancel</button>
        </div>
      ) : (
        <div className="profile-view">
          <h2>{user.username}</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Full Name:</strong> {user.fullName}</p>
          <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
        </div>
      )}

      <div className="analytics">
        <h3>Study Analytics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Study Time</div>
            <div className="stat-value">{analytics.overview.totalStudyTime} mins</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average Score</div>
            <div className="stat-value">{analytics.overview.averageScore}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Quizzes Taken</div>
            <div className="stat-value">{analytics.overview.quizzesTaken}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Current Streak</div>
            <div className="stat-value">{analytics.overview.currentStreak} days</div>
          </div>
        </div>

        <h4>Recent Activity</h4>
        <ul className="recent-activity">
          {analytics.overview && analytics.overview.recentActivity?.map((item, idx) => (
            <li key={idx}>
              <span>{new Date(item.date).toLocaleDateString()}:</span> {item.activity} — Score: {item.score}%
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
