export function getFeedback({ progress, isInactive }) {
  if (isInactive) return "You haven't worked in a while - let's reset.";
  if (progress === 0) return "Let's start small - pick one task.";
  if (progress >= 50 && progress < 100) return "Good progress, keep pushing.";
  if (progress === 100) return "Amazing work - goal completed.";
  return "Good start - keep going.";
}