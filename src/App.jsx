import React from "react";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Dashboard from "./pages/Dashboard";
import anchorLogo from "../anchor.png";

function App() {
  const {
    isLoading,
    isAuthenticated,
    user,
    loginWithRedirect,
    logout
  } = useAuth0();
  const [loadingTooLong, setLoadingTooLong] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setLoadingTooLong(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setLoadingTooLong(true);
    }, 6000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="auth-shell">
        <img src={anchorLogo} alt="Anchor logo" className="auth-logo" />
        <h1>Loading Anchor...</h1>
        {loadingTooLong && (
          <p>
            Auth is taking longer than expected. Check Auth0 Allowed Callback
            URLs, Logout URLs, and Web Origins for this localhost port.
          </p>
        )}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-shell">
        <img src={anchorLogo} alt="Anchor logo" className="auth-logo" />
        <h1>Anchor</h1>
        <p className="auth-sub">
          AI accountability for all students, especially HBCU students.
        </p>
        <button onClick={() => loginWithRedirect()}>
          Continue with Google
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-brand">
          <img src={anchorLogo} alt="Anchor logo" className="topbar-logo" />
          <div>
            <strong>Anchor</strong>
            <p>Signed in as {user?.name || user?.email}</p>
          </div>
        </div>
        <div className="topbar-actions">
          <a className="topbar-link" href="/landing%20page.html">
            Landing page
          </a>
          <button
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
          >
            Log out
          </button>
        </div>
      </div>
      <Dashboard />
    </>
  );
}

export default App;