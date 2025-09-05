import React from "react";
import { Link } from "react-router-dom";

export default function UserProfile() {
  return (
    <div className="container mt-5 text-center">
      <h2>👤 Your Profile</h2>
      <p>Profile info and settings coming soon.</p>
      <Link to="/modules" className="btn btn-outline-primary mt-4">
        ← Back to Dashboard
      </Link>
    </div>
  );
}