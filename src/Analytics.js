import React from "react";
import { Link } from "react-router-dom";

export default function Analytics() {
  return (
    <div className="container mt-5 text-center">
      <h2>📊 Exam Analytics</h2>
      <p>Detailed analytics will appear here!</p>
      <Link to="/modules" className="btn btn-outline-primary mt-4">
        ← Back to Dashboard
      </Link>
    </div>
  );
}