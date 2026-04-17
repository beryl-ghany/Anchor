/**
 * Email/password login via Auth0 Resource Owner Password grant (POST /api/login).
 * Auth0 Dashboard: Application (use a "Regular Web" app or enable Password grant) →
 * Advanced → Grant Types → Password. Set AUTH0_CLIENT_SECRET in Vercel (server-only).
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

function isValidEmail(s) {
  if (typeof s !== "string" || !s.trim()) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
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

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      code: "INVALID_EMAIL",
      error: "Enter a valid email address."
    });
  }

  if (!password || password.length < 1) {
    return res.status(400).json({
      success: false,
      code: "MISSING_PASSWORD",
      error: "Password is required."
    });
  }

  const domain = (process.env.AUTH0_DOMAIN || process.env.VITE_AUTH0_DOMAIN || "")
    .replace(/^https?:\/\//, "");
  const clientId =
    process.env.AUTH0_LOGIN_CLIENT_ID ||
    process.env.AUTH0_CLIENT_ID ||
    process.env.VITE_AUTH0_CLIENT_ID;
  const clientSecret = process.env.AUTH0_CLIENT_SECRET;
  const connection =
    process.env.AUTH0_DB_CONNECTION || "Username-Password-Authentication";

  if (!domain || !clientId || !clientSecret) {
    return res.status(503).json({
      success: false,
      code: "LOGIN_NOT_CONFIGURED",
      error:
        "Email login is not configured. Set AUTH0_DOMAIN, AUTH0_CLIENT_ID, and AUTH0_CLIENT_SECRET on the server, and enable the Password grant for that application."
    });
  }

  const tokenUrl = `https://${domain}/oauth/token`;

  const tokenBody = {
    grant_type: "password",
    username: email,
    password,
    client_id: clientId,
    client_secret: clientSecret,
    scope: "openid profile email",
    connection
  };

  async function postToken(body) {
    const r = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const t = await r.text();
    let d;
    try {
      d = t ? JSON.parse(t) : {};
    } catch {
      d = { raw: t };
    }
    return { res: r, data: d };
  }

  try {
    let { res: auth0Res, data } = await postToken(tokenBody);

    if (!auth0Res.ok && (data.error === "invalid_grant" || data.error === "unsupported_grant_type")) {
      const alt = {
        grant_type: "password",
        username: email,
        password,
        client_id: clientId,
        client_secret: clientSecret,
        scope: "openid profile email",
        realm: connection
      };
      const second = await postToken(alt);
      auth0Res = second.res;
      data = second.data;
    }

    if (!auth0Res.ok) {
      const msg =
        data.error_description ||
        data.description ||
        data.error ||
        "Login failed.";
      return res.status(401).json({
        success: false,
        code: "LOGIN_FAILED",
        error: typeof msg === "string" ? msg : "Invalid email or password."
      });
    }

    const expiresIn = typeof data.expires_in === "number" ? data.expires_in : 3600;

    return res.status(200).json({
      success: true,
      access_token: data.access_token,
      id_token: data.id_token || null,
      expires_in: expiresIn,
      token_type: data.token_type || "Bearer",
      user: { email }
    });
  } catch (err) {
    return res.status(502).json({
      success: false,
      code: "LOGIN_REQUEST_FAILED",
      error: err?.message || "Could not reach Auth0."
    });
  }
};
