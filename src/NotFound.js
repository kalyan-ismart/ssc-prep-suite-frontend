import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container text-center mt-5">
      <h1 style={{ fontSize: "3rem" }}>404</h1>
      <h3>Page Not Found</h3>
      <p>The page you’re looking for doesn’t exist.</p>
      <Link to="/modules" className="btn btn-primary mt-3">
        Back to Dashboard
      </Link>
    </div>
  );
}