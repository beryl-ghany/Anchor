/**
 * Persists goal edits from the dashboard (POST /api/goal-save).
 * Validates payload; returns echoed goal for client reconciliation.
 */

function setJsonHeaders(res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function readBody(req) {
  if (typeof req.body === "object" && req.body !== null) {
    return req.body;
  }
  if (typeof req.body === "string" && req.body.trim()) {
    return JSON.parse(req.body);
  }
  return {};
}

module.exports = async function handler(req, res) {
  setJsonHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      code: "METHOD_NOT_ALLOWED",
      error: "Method not allowed"
    });
  }

  let body;
  try {
    body = readBody(req);
  } catch (_e) {
    return res.status(400).json({
      success: false,
      code: "INVALID_JSON",
      error: "Invalid JSON"
    });
  }

  const goal = body.goal;
  if (!goal || typeof goal !== "object") {
    return res.status(400).json({
      success: false,
      code: "MISSING_GOAL",
      error: "Missing goal object."
    });
  }

  const title = typeof goal.title === "string" ? goal.title.trim() : "";
  if (title.length < 2) {
    return res.status(400).json({
      success: false,
      code: "TITLE_TOO_SHORT",
      error: "Title must be at least 2 characters."
    });
  }
  if (title.length > 300) {
    return res.status(400).json({
      success: false,
      code: "TITLE_TOO_LONG",
      error: "Title must be 300 characters or fewer."
    });
  }

  if (goal.dueDate != null && goal.dueDate !== "") {
    if (typeof goal.dueDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(goal.dueDate)) {
      return res.status(400).json({
        success: false,
        code: "INVALID_DUE_DATE",
        error: "Due date must be YYYY-MM-DD."
      });
    }
  }

  if (goal.priority != null && goal.priority !== "") {
    const p = String(goal.priority).toLowerCase();
    if (!["low", "medium", "high"].includes(p)) {
      return res.status(400).json({
        success: false,
        code: "INVALID_PRIORITY",
        error: "Priority must be low, medium, or high."
      });
    }
  }

  const tags = Array.isArray(goal.tags)
    ? goal.tags.filter((t) => typeof t === "string" && t.trim())
    : [];

  const saved = {
    ...goal,
    title,
    goal: title,
    tags: tags.length ? tags.map((t) => t.trim().slice(0, 32)) : ["general"],
    priority: goal.priority ? String(goal.priority).toLowerCase() : "medium",
    dueDate: goal.dueDate || null,
    savedAt: new Date().toISOString()
  };

  return res.status(200).json({
    success: true,
    status: "saved",
    goal: saved
  });
};
