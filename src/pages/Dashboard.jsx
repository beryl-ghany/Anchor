import React from "react";

export default function Dashboard() {
  return (
    <div className="dashboard-embed-wrap">
      <iframe
        title="Anchor Dashboard"
        src="/dashboard.html"
        className="dashboard-embed"
      />
    </div>
  );
}