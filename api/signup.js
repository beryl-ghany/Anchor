/**
 * Auth0 Database connection signup (POST /api/signup).
 * Requires Auth0: Applications → your SPA → Connections → Username-Password-Authentication enabled.
 * Env: AUTH0_DOMAIN, AUTH0_CLIENT_ID (same app client id as VITE_AUTH0_CLIENT_ID).
 */

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;
const MAX_EMAIL = 254;
const MAX_NAME = 120;
const MAX_FOCUS = 200;

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

function isValidEmail(s) {
  if (typeof s !== "string" || !s.trim()) return false;
  const t = s.trim();
  if (t.length > MAX_EMAIL) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

function validatePayload(body) {
  const errors = [];
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const focus =
    typeof body.focus === "string"
      ? body.focus.trim()
      : typeof body.profileFocus === "string"
        ? body.profileFocus.trim()
        : "";

  if (!email) errors.push({ field: "email", message: "Email is required." });
  else if (!isValidEmail(email)) errors.push({ field: "email", message: "Enter a valid email address." });

  if (!password) errors.push({ field: "password", message: "Password is required." });
  else {
    if (password.length < MIN_PASSWORD) {
      errors.push({
        field: "password",
        message: `Password must be at least ${MIN_PASSWORD} characters.`
      });
    }
    if (password.length > MAX_PASSWORD) {
      errors.push({ field: "password", message: "Password is too long." });
    }
    if (!/[0-9]/.test(password)) {
      errors.push({ field: "password", message: "Password must include at least one number." });
    }
  }

  if (!name) errors.push({ field: "name", message: "Name is required." });
  else if (name.length < 2) errors.push({ field: "name", message: "Name must be at least 2 characters." });
  else if (name.length > MAX_NAME) errors.push({ field: "name", message: "Name is too long." });

  if (!focus) {
    errors.push({ field: "focus", message: "Primary focus is required." });
  } else if (focus.length < 2) {
    errors.push({ field: "focus", message: "Primary focus must be at least 2 characters." });
  } else if (focus.length > MAX_FOCUS) {
    errors.push({ field: "focus", message: "Primary focus is too long." });
  }

  return { errors, email, password, name, focus };
}

module.exports = async function handler(req, res) {
  setJsonHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      status: "error",
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
      status: "error",
      code: "INVALID_JSON",
      error: "Invalid JSON"
    });
  }

  const { errors, email, password, name, focus } = validatePayload(body);
  if (errors.length) {
    return res.status(400).json({
      success: false,
      status: "error",
      code: "VALIDATION_ERROR",
      error: "Validation failed",
      details: errors
    });
  }

  const domain = process.env.AUTH0_DOMAIN || process.env.VITE_AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID || process.env.VITE_AUTH0_CLIENT_ID;
  const connection =
    process.env.AUTH0_DB_CONNECTION || "Username-Password-Authentication";

  if (!domain || !clientId) {
    return res.status(503).json({
      success: false,
      status: "error",
      code: "SIGNUP_NOT_CONFIGURED",
      error: "Sign-up is not configured (missing AUTH0_DOMAIN / AUTH0_CLIENT_ID on the server)."
    });
  }

  const signupUrl = `https://${domain.replace(/^https?:\/\//, "")}/dbconnections/signup`;

  try {
    const auth0Res = await fetch(signupUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        email,
        password,
        connection,
        user_metadata: {
          full_name: name,
          focus
        }
      })
    });

    const text = await auth0Res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!auth0Res.ok) {
      const description =
        data.description ||
        data.message ||
        data.error ||
        `Auth0 signup failed (${auth0Res.status})`;
      return res.status(400).json({
        success: false,
        status: "error",
        code: "AUTH0_SIGNUP_FAILED",
        error: typeof description === "string" ? description : "Sign-up failed.",
        details: data.code ? [{ field: "_auth0", message: String(data.code) }] : []
      });
    }

    return res.status(201).json({
      success: true,
      status: "success",
      message: "Account created.",
      user: {
        email: data.email || email,
        name,
        focus
      }
    });
  } catch (err) {
    return res.status(502).json({
      success: false,
      status: "error",
      code: "SIGNUP_REQUEST_FAILED",
      error: err?.message || "Could not reach Auth0."
    });
  }
};
