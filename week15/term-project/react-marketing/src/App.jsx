import { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import MarketingPage from "./components/MarketingPage";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const fallbackProperty = {
  name: "Maui Surf House",
  island: "Maui",
  type: "vacation rental",
  description: "A surf-friendly vacation stay in Kihei for Australians visiting Maui.",
  amenities: ["Surfboard storage", "Outdoor shower", "Jeep or Tacoma rental"],
  targetSegment: "Australian surfers",
  imageURL:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
  reviews: []
};

export default function App() {
  const [property, setProperty] = useState(fallbackProperty);
  const [loadState, setLoadState] = useState("loading");
  const [authStatus, setAuthStatus] = useState("checking");
  const [sessionUser, setSessionUser] = useState(null);
  const [showLogin, setShowLogin] = useState(window.location.hash === "#login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProperty() {
      try {
        const response = await fetch(`${API_BASE}/properties?format=json`);

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const properties = await response.json();

        if (isMounted && Array.isArray(properties) && properties.length > 0) {
          setProperty(properties[0]);
          setLoadState("loaded");
        } else if (isMounted) {
          setProperty(fallbackProperty);
          setLoadState("fallback");
        }
      } catch (error) {
        if (isMounted) {
          setProperty(fallbackProperty);
          setLoadState("fallback");
        }
      }
    }

    loadProperty();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleHashChange() {
      setShowLogin(window.location.hash === "#login");
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const response = await fetch(`${API_BASE}/auth/session`, {
          credentials: "include",
          cache: "no-store"
        });
        const payload = await response.json();

        if (!isMounted) {
          return;
        }

        if (payload.authenticated) {
          setSessionUser(payload.user);
          setAuthStatus("authenticated");
        } else {
          setSessionUser(null);
          setAuthStatus("guest");
        }
      } catch (error) {
        if (isMounted) {
          setSessionUser(null);
          setAuthStatus("guest");
        }
      }
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setAuthStatus("submitting");
    setLoginError("");

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ username, password })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Login failed");
      }

      setSessionUser(payload.user);
      setAuthStatus("authenticated");
      window.location.hash = "";
      setPassword("");
    } catch (error) {
      setSessionUser(null);
      setAuthStatus("guest");
      setLoginError(error.message || "Unable to log in.");
    }
  }

  async function handleLogout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } finally {
      setSessionUser(null);
      setAuthStatus("guest");
      setUsername("");
      setPassword("");
    }
  }

  return (
    <main className="page-shell">
      {sessionUser ? (
        <section className="session-banner" aria-label="Current session">
          <div>
            <p className="session-meta">Signed in as</p>
            <strong>{sessionUser.username || sessionUser.displayName} ({sessionUser.role})</strong>
          </div>
          <button className="button secondary logout-button" onClick={handleLogout} type="button">
            Log out
          </button>
        </section>
      ) : null}

      {showLogin && !sessionUser && (
        <section className="auth-card" id="login" aria-labelledby="login-title">
          <p className="eyebrow">Secure Login</p>
          <h2 id="login-title">Sign in to Hawaii Hospitality Dashboard</h2>
          <a className="button primary auth-submit" href={`${API_BASE}/auth/google`}>
            Continue with Google
          </a>
          <form className="auth-form" onSubmit={handleLogin}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            {loginError && <p className="auth-error">{loginError}</p>}

            <button className="button primary auth-submit" type="submit">
              {authStatus === "submitting" ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>
      )}

      <MarketingPage property={property} loadState={loadState} />
      <Dashboard property={property} />
    </main>
  );
}
