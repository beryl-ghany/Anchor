const FALLBACK_TASKS = ["Step 1", "Step 2", "Step 3", "Step 4"];

function parseSteps(rawText) {
  try {
    const parsed = JSON.parse(rawText);
    if (
      Array.isArray(parsed) &&
      parsed.length === 4 &&
      parsed.every((step) => typeof step === "string")
    ) {
      return parsed;
    }
  } catch (_error) {
    return null;
  }

  return null;
}

export async function generateTasks(goal) {
  const trimmedGoal = goal.trim();
  if (!trimmedGoal) {
    throw new Error("Please enter a goal before generating a plan.");
  }

  // Fake AI first so UI flow is always usable.
  if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
    return FALLBACK_TASKS;
  }

  const prompt = `Break this goal into exactly 4 clear, actionable steps.

Goal: "${trimmedGoal}"

Rules:
- Each step must be short
- No explanations
- Return ONLY a JSON array of 4 strings`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
    return FALLBACK_TASKS;
  }

  const data = await response.json();
  const textOutput = data?.content?.[0]?.text ?? "";
  const parsed = parseSteps(textOutput);
  return parsed ?? FALLBACK_TASKS;
}