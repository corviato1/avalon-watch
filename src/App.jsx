import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase, isMockMode } from "./lib/supabaseClient";
import Landing from "./pages/Landing.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  const [session, setSession] = useState(null);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession || null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const authed = Boolean(session?.access_token);
  const email = session?.user?.email || null;

  const isAdminRoute = useMemo(() => location.pathname.startsWith("/admin"), [location.pathname]);

  return (
    <div className="container">
      <div className="header">
        <div className="row">
          <Link to="/"><b>BTC Solo Win Monitor</b></Link>
          <div className="nav">
            <Link to="/admin">Admin</Link>
          </div>
        </div>

        <div className="row">
          {authed ? (
            <>
              <span className="muted">Signed in: <b>{email}</b></span>
              <button onClick={() => supabase.auth.signOut()}>Logout</button>
            </>
          ) : (
            <>
              {isAdminRoute ? <span className="muted">Admin login required</span> : null}
            </>
          )}
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/admin"
          element={(authed || isMockMode) ? <Admin accessToken={session?.access_token || "mock-token"} /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
