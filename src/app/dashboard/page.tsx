// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

type Status = "idle" | "ok" | "error";

export default function DashboardPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [payload, setPayload] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/me/init", { method: "GET" });
        const json = await res.json();
        setPayload(json);
        setStatus(res.ok ? "ok" : "error");
      } catch {
        setStatus("error");
      }
    })();
  }, []);

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Account initialization and environment status.
          </p>
        </div>
      </header>

      <SignedOut>
        <section className="card">
          <div className="card-body">
            <p className="card-subtitle">
              Please <SignInButton>sign in</SignInButton> to continue.
            </p>
          </div>
        </section>
      </SignedOut>

      <SignedIn>
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Initialization</h2>
              <p className="card-subtitle">
                This shows the raw payload from <code>/api/me/init</code>.
              </p>
            </div>
          </div>

          <div className="card-body">
            {status === "idle" && (
              <p className="card-subtitle">Initializing your account…</p>
            )}

            {status === "ok" && (
              <pre
                style={{
                  fontSize: "0.75rem",
                  lineHeight: 1.4,
                  padding: "0.75rem 0.9rem",
                  borderRadius: "0.75rem",
                  background: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(148, 163, 184, 0.35)",
                  overflowX: "auto",
                  maxHeight: "420px",
                  overflowY: "auto",
                }}
              >
                {JSON.stringify(payload, null, 2)}
              </pre>
            )}

            {status === "error" && (
              <p
                className="card-subtitle"
                style={{ color: "#fecaca" }}
              >
                Initialization failed. Check server logs.
              </p>
            )}
          </div>
        </section>
      </SignedIn>
    </main>
  );
}
