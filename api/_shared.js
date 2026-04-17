const MAX_GOAL_LENGTH = 300;
const MAX_NOTES_LENGTH = 2000;
const GOAL_FIELD_ALIASES = ["goal", "prompt", "input", "text", "objective", "task"];
const ENUM_FIELD_RULES = {
  status: ["active", "pending", "done"],
  level: ["low", "medium", "high"],
  category: ["study", "project", "career", "general"],
  priorityLevel: ["low", "medium", "high"],
  difficulty: ["easy", "medium", "hard"]
};

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

function jsonError(res, status, code, error, details = []) {
  return res.status(status).json({
    success: false,
    status: "error",
    code,
    error,
    message: error,
    details
  });
}

function getRawGoal(payload) {
  for (const key of GOAL_FIELD_ALIASES) {
    if (payload?.[key] !== undefined) {
      return payload[key];
    }
  }
  return undefined;
}

function buildSteps(goal) {
  const normalizedGoal = goal.toLowerCase();

  if (
    normalizedGoal.includes("exam") ||
    normalizedGoal.includes("test") ||
    normalizedGoal.includes("midterm") ||
    normalizedGoal.includes("final")
  ) {
    return [
      "List all exam topics and weak areas",
      "Create a 3-day focused study plan",
      "Complete timed practice questions",
      "Review mistakes and finalize key notes"
    ];
  }

  if (
    normalizedGoal.includes("project") ||
    normalizedGoal.includes("capstone") ||
    normalizedGoal.includes("app")
  ) {
    return [
      "Define project scope and deliverables",
      "Build core features end to end",
      "Test all major user flows",
      "Polish, document, and submit"
    ];
  }

  return [
    "Define the exact goal outcome",
    "Break the goal into concrete milestones",
    "Complete the highest-impact first task",
    "Review progress and adjust the next step"
  ];
}

function handleGenerateRequest(req, res) {
  setJsonHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return jsonError(res, 405, "METHOD_NOT_ALLOWED", "Method not allowed");
  }

  let payload;
  try {
    payload = readBody(req);
  } catch (_error) {
    return jsonError(res, 400, "INVALID_JSON", "Invalid JSON format");
  }

  const rawGoal = getRawGoal(payload);
  if (rawGoal === null) {
    return jsonError(res, 400, "NULL_GOAL", "Goal cannot be null");
  }

  if (typeof rawGoal !== "string") {
    return jsonError(
      res,
      400,
      "MISSING_GOAL",
      "Missing required field: goal",
      [`Provide one of: ${GOAL_FIELD_ALIASES.join(", ")}`]
    );
  }

  const goal = rawGoal.trim();
  if (!goal) {
    return jsonError(res, 400, "EMPTY_GOAL", "Goal cannot be empty");
  }

  if (goal.length > MAX_GOAL_LENGTH) {
    return jsonError(
      res,
      413,
      "GOAL_TOO_LARGE",
      `Goal is too long. Max length is ${MAX_GOAL_LENGTH} characters.`
    );
  }

  if (payload?.notes !== undefined) {
    if (payload.notes === null) {
      return jsonError(res, 400, "NULL_NOTES", "Notes cannot be null");
    }

    if (typeof payload.notes !== "string") {
      return jsonError(
        res,
        400,
        "INVALID_NOTES_TYPE",
        "Invalid data type for notes. Expected string."
      );
    }

    if (payload.notes.length > MAX_NOTES_LENGTH) {
      return jsonError(
        res,
        413,
        "NOTES_TOO_LARGE",
        `Notes is too long. Max length is ${MAX_NOTES_LENGTH} characters.`
      );
    }
  }

  if (payload?.priority !== undefined) {
    if (payload.priority === null) {
      return jsonError(res, 400, "NULL_PRIORITY", "Priority cannot be null");
    }

    if (typeof payload.priority !== "number" || Number.isNaN(payload.priority)) {
      return jsonError(
        res,
        400,
        "INVALID_PRIORITY_TYPE",
        "Invalid data type for priority. Expected number."
      );
    }

    if (payload.priority < 0 || payload.priority > 5) {
      return jsonError(
        res,
        400,
        "PRIORITY_OUT_OF_RANGE",
        "Priority must be between 0 and 5."
      );
    }
  }

  if (payload?.referenceUrl !== undefined) {
    if (payload.referenceUrl === null) {
      return jsonError(res, 400, "NULL_URL", "referenceUrl cannot be null");
    }

    if (typeof payload.referenceUrl !== "string") {
      return jsonError(
        res,
        400,
        "INVALID_URL_TYPE",
        "Invalid data type for referenceUrl. Expected string URL."
      );
    }

    try {
      // eslint-disable-next-line no-new
      new URL(payload.referenceUrl);
    } catch (_error) {
      return jsonError(
        res,
        400,
        "INVALID_URL",
        "Invalid URL format in referenceUrl."
      );
    }
  }

  for (const [field, allowed] of Object.entries(ENUM_FIELD_RULES)) {
    if (payload?.[field] === undefined) continue;
    if (payload[field] === null) {
      return jsonError(res, 400, "NULL_ENUM", `${field} cannot be null`);
    }
    if (typeof payload[field] !== "string") {
      return jsonError(
        res,
        400,
        "INVALID_ENUM_TYPE",
        `${field} must be a string enum value`
      );
    }

    const normalized = payload[field].toLowerCase();
    if (!allowed.includes(normalized)) {
      return jsonError(
        res,
        400,
        "INVALID_ENUM_VALUE",
        `${field} must be one of: ${allowed.join(", ")}`
      );
    }
  }

  const steps = buildSteps(goal);
  const duplicate = Boolean(payload?.idempotencyKey && payload.idempotencyKey === goal);

  return res.status(200).json({
    success: true,
    status: "success",
    message: "Plan generated successfully",
    goal,
    steps,
    tasks: steps,
    count: steps.length,
    duplicate
  });
}

module.exports = { handleGenerateRequest };
