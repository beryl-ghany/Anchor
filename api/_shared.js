const MAX_GOAL_LENGTH = 300;

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
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
      code: "METHOD_NOT_ALLOWED"
    });
  }

  let payload;
  try {
    payload = readBody(req);
  } catch (_error) {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON format",
      code: "INVALID_JSON"
    });
  }

  const rawGoal = payload?.goal;
  if (typeof rawGoal !== "string") {
    return res.status(400).json({
      success: false,
      error: "Missing required field: goal",
      code: "MISSING_GOAL"
    });
  }

  const goal = rawGoal.trim();
  if (!goal) {
    return res.status(400).json({
      success: false,
      error: "Goal cannot be empty",
      code: "EMPTY_GOAL"
    });
  }

  if (goal.length > MAX_GOAL_LENGTH) {
    return res.status(413).json({
      success: false,
      error: `Goal is too long. Max length is ${MAX_GOAL_LENGTH} characters.`,
      code: "GOAL_TOO_LARGE"
    });
  }

  const steps = buildSteps(goal);

  return res.status(200).json({
    success: true,
    goal,
    steps,
    tasks: steps,
    count: steps.length
  });
}

module.exports = { handleGenerateRequest };
