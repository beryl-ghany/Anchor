import React from "react";

export default function ProgressBar({ progress }) {
  if (progress === null) return null;

  return (
    <div className="progress-wrap">
      <p>{progress}% complete</p>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}