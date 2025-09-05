import React from "react";
import { useParams, Link } from "react-router-dom";

export default function ToolInterface() {
  const { toolId } = useParams();

  return (
    <div className="container mt-5 text-center">
      <h2>Tool: {toolId}</h2>
      <p>This is where your tool’s interface will appear.</p>
      <Link to="/modules" className="btn btn-outline-primary mt-4">
        ← Back to Dashboard
      </Link>
    </div>
  );
}