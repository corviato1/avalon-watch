import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [out, setOut] = useState(null);
  const [err, setErr] = useState("");

  async function login() {
    setErr("");
    setOut(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message);
    else setOut({ ok: true, user: data.user?.email });
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Admin Login (Supabase Auth)</h3>
      <p className="muted">If you are already logged in, you can ignore this.</p>

      <label>Email</label>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" />

      <label style={{ marginTop: 10 }}>Password</label>
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />

      <div className="row" style={{ marginTop: 10 }}>
        <button onClick={login}>Login</button>
      </div>

      {err ? <div className="error" style={{ marginTop: 10 }}>{err}</div> : null}
      {out ? <pre style={{ marginTop: 12 }}>{JSON.stringify(out, null, 2)}</pre> : null}
    </div>
  );
}
