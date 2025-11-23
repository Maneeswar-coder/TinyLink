// app/page.js
// Assignment reference PDF (local): /mnt/data/Take-Home Assignment_ TinyLink (1) (2).pdf

"use client";

import { useEffect, useState } from "react";

/**
 * Final single-file page.js
 * - Includes: Login / Register UI (modals), Create link, List links, Delete link
 * - Integrates with backend routes:
 *   POST /api/register
 *   POST /api/login
 *   POST /api/logout
 *   GET  /api/me
 *   POST /api/create
 *   GET  /api/links
 *   DELETE /api/links/:code
 *
 * Notes:
 * - Cookies for auth are HttpOnly and set by the server. We read /api/me to get user.
 * - This file uses only plain CSS (no CSS variables) and keeps the neon glass UI you approved.
 */

export default function Page() {
  const [user, setUser] = useState(null);
  const [links, setLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(false);

  const [url, setUrl] = useState("");
  const [creating, setCreating] = useState(false);

  // auth modals
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // forms
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // toasts
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    // whenever user changes, refresh links
    if (user) fetchLinks();
    else setLinks([]);
  }, [user]);

  function showToast(msg, type = "info") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchMe() {
    try {
      const res = await fetch("/api/me");
      const data = await res.json();
      if (data?.user) setUser(data.user);
      else setUser(null);
    } catch (err) {
      console.error("me", err);
      setUser(null);
    }
  }

  async function register(e) {
    e?.preventDefault();
    if (!regEmail || !regPassword) {
      showToast("Enter email and password", "error");
      return;
    }
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail, password: regPassword }),
      });
      const data = await res.json();
      if (data?.ok) {
        showToast("Registered — please login", "success");
        setShowRegister(false);
        setRegEmail("");
        setRegPassword("");
      } else {
        showToast(data?.error || "Register failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Register failed", "error");
    }
  }

  async function login(e) {
    e?.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast("Enter email and password", "error");
      return;
    }
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      // server sets cookie; we must call /api/me after login
      const data = await res.json();
      if (res.status === 200 && data?.ok) {
        await fetchMe();
        showToast("Logged in", "success");
        setShowLogin(false);
        setLoginEmail("");
        setLoginPassword("");
      } else {
        showToast(data?.error || "Login failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Login failed", "error");
    }
  }

  async function logout() {
    try {
      await fetch("/api/logout", { method: "POST" });
      setUser(null);
      setLinks([]);
      showToast("Logged out", "info");
    } catch (err) {
      console.error(err);
      showToast("Logout failed", "error");
    }
  }

  async function fetchLinks() {
    setLoadingLinks(true);
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      if (data?.ok) setLinks(data.links || []);
      else {
        // possibly unauthorized
        if (res.status === 401) {
          setUser(null);
          setLinks([]);
        }
        showToast(data?.error || "Could not load links", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Could not load links", "error");
    } finally {
      setLoadingLinks(false);
    }
  }

  function getShortUrl(code) {
    if (typeof window === "undefined") return `/${code}`;
    return `${window.location.origin}/${code}`;
  }

  async function createLink(e) {
    e?.preventDefault();
    if (!user) {
      showToast("Login to create links", "error");
      return;
    }
    if (!url || url.trim() === "") {
      showToast("Enter a valid URL", "error");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data?.ok) {
        showToast("Short link created", "success");
        setUrl("");
        await fetchLinks();
      } else {
        showToast(data?.error || "Create failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Create failed", "error");
    } finally {
      setCreating(false);
    }
  }

  async function deleteLink(code) {
    if (!confirm("Delete this short link?")) return;
    try {
      const res = await fetch(`/api/links/${code}`, { method: "DELETE" });
      const data = await res.json();
      if (data?.ok) {
        showToast("Deleted", "success");
        setLinks((s) => s.filter((l) => l.code !== code));
      } else {
        showToast(data?.error || "Delete failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Delete failed", "error");
    }
  }

  async function copyShort(code) {
    const t = getShortUrl(code);
    try {
      await navigator.clipboard.writeText(t);
      showToast("Copied to clipboard", "success");
    } catch (err) {
      console.error(err);
      showToast("Copy failed", "error");
    }
  }

  // quick helper to format date or show '-'
  function fmt(d) {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  }

  // Render
  return (
    <main className="page">
      <header className="topbar">
        <div className="container topbar-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="brand">TinyLink</div>
            
          </div>

          <div className="nav">
            {user ? (
              <>
                <div style={{ color: "rgba(245, 84, 84, 0.96)", fontWeight: 1000 , }}>
                  {user.email}
                </div>
                <button className="btn outline" onClick={logout} >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="btn outline" onClick={() => setShowLogin(true)}>
                  Login
                </button>
                <button className="btn accent" onClick={() => setShowRegister(true)}>
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <h1 className="title neon">TinyLink — Shorten & Track</h1>
          <p className="subtitle">
            Create short links and view click statistics. Login required to manage your links.
          </p>

          <form className="card create-card" onSubmit={createLink}>
            <div className="input-row">
              <input
                className="url-input"
                placeholder={user ? "Paste your long URL here..." : "Login to create short links"}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={!user}
              />
              <button className="btn orange" type="submit" disabled={!user || creating}>
                {creating ? "Creating..." : "Create"}
              </button>
            </div>

            <div className="hint">
              Example: <span className="mono">https://example.com/very/long/url</span>
            </div>
          </form>

          <div className="links-section">
            <h3 className="section-title">Your Links</h3>

            {user ? (
              loadingLinks ? (
                <div className="loader">Loading links…</div>
              ) : links.length === 0 ? (
                <div className="empty">No links yet — create one above.</div>
              ) : (
                <div className="links-grid">
                  {links.map((l) => (
                    <article className="card link-card" key={l.code}>
                      <div className="link-top">
                        <a className="short" href={getShortUrl(l.code)} target="_blank" rel="noreferrer">
                          TinyLink-{l.code}
                        </a>

                        <div className="actions">
                          <button className="btn small" onClick={() => copyShort(l.code)}>
                            Copy
                          </button>
                          <button className="btn small" onClick={() => window.open(getShortUrl(l.code), "_blank")}>
                            Open
                          </button>
                          <button className="btn danger small" onClick={() => deleteLink(l.code)}>
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="meta">
                        <div className="meta-row">
                          <div className="meta-label">Original:</div>
                          <div className="meta-value wrap">{l.url}</div>
                        </div>

                        <div className="meta-row">
                          <div className="meta-label">Clicks:</div>
                          <div className="meta-value">{l.clicks ?? 0}</div>

                          <div className="meta-label">Last Click:</div>
                          <div className="meta-value">{fmt(l.lastClicked)}</div>
                        </div>

                        <div className="meta-row">
                          <div className="meta-label">Created:</div>
                          <div className="meta-value">{fmt(l.createdAt)}</div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )
            ) : (
              <div className="empty">Please login to view and manage your links.</div>
            )}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div>© {new Date().getFullYear()} TinyLink</div>
          <div className="footer-links">
            <button className="btn outline" onClick={() => window.open("https://vercel.com", "_blank")}>
              Deploy
            </button>
          </div>
        </div>
      </footer>

      {/* Login Model */}
      {showLogin && (
        <div className="modal-wrap" onClick={() => setShowLogin(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Login</h3>
            <form onSubmit={login}>
              <input
                className="modal-input"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <input
                className="modal-input"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                type="password"
              />
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className="btn accent" type="submit">
                  Login
                </button>
                <button
                  className="btn outline"
                  type="button"
                  onClick={() => {
                    setShowLogin(false);
                    setShowRegister(true);
                  }}
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="modal-wrap" onClick={() => setShowRegister(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Register</h3>
            <form onSubmit={register}>
              <input
                className="modal-input"
                placeholder="Email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
              <input
                className="modal-input"
                placeholder="Password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                type="password"
              />
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className="btn accent" type="submit">
                  Register
                </button>
                <button className="btn outline" type="button" onClick={() => setShowRegister(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Plain CSS (no variables) */}
      <style jsx>{`
        * { box-sizing: border-box; }
        body, html, #__next { height: 100%; margin: 0; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto; color: #e6edf3; }

        .page { min-height: 100vh; background: radial-gradient(1200px 600px at 10% 10%, rgba(5,20,30,0.7), transparent), linear-gradient(180deg, #0b0f12 0%, #0f1a22 100%); background-color: #0f1113; }

        .container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }

        /* topbar */
        .topbar { border-bottom: 1px solid rgba(255,255,255,0.03); backdrop-filter: blur(4px); box-shadow: 0 6px 30px rgba(2,8,12,0.5); }
        .topbar-inner { height: 64px; display:flex; align-items:center; justify-content:space-between; }
        .brand { font-weight: 800; color: #19d3ff; font-size: 18px; }
        .nav { display:flex; gap:12px; align-items:center; }

        /* buttons */
        .btn { padding: 10px 14px; border-radius: 8px; border: 0; cursor: pointer; font-weight: 600; background: transparent; color: #e6edf3; }
        .btn.outline { border: 1px solid rgba(255,255,255,0.06); }
        .btn.accent { background: #19d3ff; color: #06232a; box-shadow: 0 6px 18px rgba(25,211,255,0.08); }
        .btn.small { padding: 6px 10px; font-size: 14px; }
        .btn.danger { background: linear-gradient(180deg,#ff7b7b,#ff4d4d); color: white; }
        .btn.orange { background: linear-gradient(180deg,#ff8a28,#ff5a04); color: white; min-width: 120px; }
        .btn:active { transform: translateY(1px); }

        /* hero */
        .hero { padding: 48px 0 80px; text-align:center; }
        .title { font-size: 42px; margin: 6px 0 8px; color: #f5f7f9; }
        .neon { position: relative; display:inline-block; }
        .neon::after { content: ""; position:absolute; left:-6px; right:-6px; top:50%; height:44%; transform:translateY(-50%); filter: blur(30px); opacity: 0.14; background: linear-gradient(90deg,#ff7a18, rgba(255,140,60,0.6)); border-radius:6px; z-index:-1; }
        .subtitle { color: rgba(230,237,243,0.65); margin-bottom: 22px; }

        /* card / glass */
        .card { border-radius:12px; padding:18px; border: 1px solid rgba(255,255,255,0.03); background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); backdrop-filter: blur(6px); box-shadow: 0 6px 30px rgba(2,8,12,0.6); }
        .create-card { max-width: 840px; margin: 18px auto 28px; animation: floatIn 600ms ease both; }
        .input-row { display:flex; gap:14px; align-items:center; }

        .url-input { flex:1; background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.04); padding: 14px 16px; border-radius: 10px; color: #e8f3fb; font-size:15px; outline:none; }
        .url-input::placeholder { color: rgba(230,237,243,0.35); }
        .hint { margin-top:10px; color: rgba(230,237,243,0.45); font-size:13px; text-align:left; }
        .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace; color: rgba(230,237,243,0.85); background: rgba(255,255,255,0.02); padding:4px 8px; border-radius:6px; }

        /* links list */
        .links-section { margin-top:22px; max-width:840px; margin-left:auto; margin-right:auto; text-align:left; }
        .section-title { color: #19d3ff; font-weight:700; margin-bottom:12px; }
        .links-grid { display:flex; flex-direction:column; gap:14px; }
        .link-card { padding:16px; border-radius:12px; }
        .link-top { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:8px; }
        .short { color: #ff7a18; font-weight:700; text-decoration:none; }
        .actions { display:flex; gap:10px; }

        .meta { margin-top:8px; color: rgba(230,237,243,0.85); font-size:14px; }
        .meta-row { display:flex; gap:10px; align-items:flex-start; flex-wrap:wrap; margin-top:8px; }
        .meta-label { width:88px; color: rgba(230,237,243,0.6); font-weight:700; }
        .meta-value { color: rgba(230,237,243,0.9); flex:1; }
        .wrap { word-break: break-word; white-space: normal; max-width:100%; }

        .loader, .empty { color: rgba(230,237,243,0.6); padding:16px; }

        /* footer */
        .footer { margin-top:60px; border-top:1px solid rgba(255,255,255,0.03); padding:18px 0; }
        .footer-inner { display:flex; justify-content:space-between; align-items:center; color: rgba(230,237,243,0.6); }

        .footer-links { display:flex; gap:18px; }
        .footer-links a { color: rgba(230,237,243,0.55); cursor:pointer; }

        /* modal */
        .modal-wrap { position: fixed; left:0; right:0; top:0; bottom:0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.45); z-index:100; }
        .modal { width: 360px; max-width: 92%; padding: 18px; border-radius: 12px; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.03); box-shadow: 0 12px 40px rgba(0,0,0,0.6); }
        .modal h3 { margin: 0 0 10px 0; color: #f5f7f9; }
        .modal-input { width:100%; padding:10px 12px; margin-top:8px; border-radius:8px; border:1px solid rgba(255,255,255,0.04); background: rgba(0,0,0,0.3); color:#e6edf3; }

        /* toast */
        .toast { position: fixed; right: 20px; bottom: 28px; padding: 12px 18px; border-radius: 10px; backdrop-filter: blur(6px); box-shadow: 0 12px 30px rgba(2,8,12,0.7); font-weight:700; z-index: 60; color:#061116; }
        .toast.info { background: linear-gradient(90deg,#CCDFFB,#C4FFF6); color:#00232b; }
        .toast.success { background: linear-gradient(90deg,#b4f69a,#a2ffeb); color:#00331b; }
        .toast.error { background: linear-gradient(90deg,#ff9aa2,#ffcf9a); color:#3b0a00; }

        /* animation */
        @keyframes floatIn { from { transform: translateY(14px); opacity:0 } to { transform: translateY(0); opacity:1 } }

        /* responsive */
        @media (max-width: 880px) {
          .title { font-size: 28px; }
          .create-card { margin: 12px; padding: 14px; }
          .container, .topbar-inner { padding: 0 14px; }
          .meta-label { width: 90px; }
        }
      `}</style>
    </main>
  );
}
