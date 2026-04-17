import React from "react";

export default function TaskList({ tasks, completed, toggleTask }) {
  if (!tasks.length) return null;

  return (
    <div className="task-list">
      <h2>Your Plan</h2>
      {tasks.map((task, index) => (
        <label key={index} className="task-item">
          <input
            type="checkbox"
            checked={completed.includes(index)}
            onChange={() => toggleTask(index)}
          />
          {task}
        </label>
      ))}
    </div>
  );
}