import React, { useState } from "react";

export default function GoalInput({ onGenerate, loading }) {
  const [goal, setGoal] = useState("");

  const handleSubmit = () => {
    onGenerate(goal);
  };

  return (
    <div className="goal-input">
      <label htmlFor="goal-input">What&apos;s your goal today?</label>
      <div className="goal-input-row">
        <input
          id="goal-input"
          type="text"
          placeholder="Pass my stats exam, finish capstone, apply for internships..."
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
        />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Generating..." : "Generate Plan"}
        </button>
      </div>
    </div>
  );
}