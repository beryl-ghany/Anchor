import React from "react";

export default function FeedbackBox({ message }) {
  if (!message) return null;
  return <p className="feedback">{message}</p>;
}