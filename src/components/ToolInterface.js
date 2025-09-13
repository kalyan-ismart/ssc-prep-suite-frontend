// src/components/ToolInterface.js

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTool } from "../services/api";

export default function ToolInterface() {
  const { toolId } = useParams();
  const navigate = useNavigate();

  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTool() {
      setLoading(true);
      try {
        const res = await getTool(toolId);
        setTool(res.data.data);
      } catch (err) {
        console.error("Tool loading error:", err);
        setError("Failed to load tool. It may not exist.");
      } finally {
        setLoading(false);
      }
    }
    fetchTool();
  }, [toolId]);

  if (loading) {
    return <div>Loading tool...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (!tool) {
    return <div>Tool not found.</div>;
  }

  return (
    <div className="tool-interface">
      <header>
        <button onClick={() => navigate(-1)}>← Back</button>
        <h2>{tool.name}</h2>
      </header>
      <section>
        <p>{tool.description}</p>
        {/* TODO: Render tool-specific UI based on tool.toolType or settings */}
      </section>
    </div>
  );
}
