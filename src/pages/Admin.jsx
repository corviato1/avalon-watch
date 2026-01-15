import AdminLogin from "../components/AdminLogin.jsx";
import AdminQueues from "../components/AdminQueues.jsx";

export default function Admin({ accessToken }) {
  return (
    <div className="grid">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Admin</h2>
        <p className="muted">
          You are signed in. This page will only work for users marked as admins in Supabase.
        </p>
      </div>

      <AdminLogin />
      <AdminQueues accessToken={accessToken} />
    </div>
  );
}
