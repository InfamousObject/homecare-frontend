// src/app/caregivers/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

type Caregiver = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  max_weekly_hours: number | null;
  preferred_hours_per_week: number | null;
};

export default function CaregiversPage() {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [maxWeeklyHours, setMaxWeeklyHours] = useState<number | "">("");
  const [preferredHoursPerWeek, setPreferredHoursPerWeek] = useState<
    number | ""
  >("");

  async function fetchCaregivers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/caregivers");
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to load caregivers");
      }
      setCaregivers(json.caregivers ?? []);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCaregivers();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/caregivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          maxWeeklyHours: maxWeeklyHours === "" ? null : Number(maxWeeklyHours),
          preferredHoursPerWeek:
            preferredHoursPerWeek === "" ? null : Number(preferredHoursPerWeek),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to create caregiver");
      }

      setCaregivers((prev) => [json.caregiver, ...prev]);

      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setMaxWeeklyHours("");
      setPreferredHoursPerWeek("");
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Caregivers</h1>
          <p className="page-subtitle">
            Add new caregivers and manage your existing roster.
          </p>
        </div>
      </header>

      <SignedOut>
        <section className="card">
          <div className="card-body">
            <p className="card-subtitle">
              Please <SignInButton>sign in</SignInButton> to manage caregivers.
            </p>
          </div>
        </section>
      </SignedOut>

      <SignedIn>
        {/* Add caregiver form */}
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Add caregiver</h2>
              <p className="card-subtitle">
                Basic details to get them into your schedule.
              </p>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-field">
                <label className="form-label" htmlFor="firstName">
                  First name
                </label>
                <input
                  id="firstName"
                  className="input"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="lastName">
                  Last name
                </label>
                <input
                  id="lastName"
                  className="input"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  placeholder="jane.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="phone">
                  Phone
                </label>
                <input
                  id="phone"
                  className="input"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="maxWeeklyHours">
                  Max weekly hours
                </label>
                <input
                  id="maxWeeklyHours"
                  className="input"
                  type="number"
                  placeholder="e.g. 40"
                  value={maxWeeklyHours}
                  onChange={(e) =>
                    setMaxWeeklyHours(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="preferredHoursPerWeek">
                  Preferred hours / week
                </label>
                <input
                  id="preferredHoursPerWeek"
                  className="input"
                  type="number"
                  placeholder="e.g. 30"
                  value={preferredHoursPerWeek}
                  onChange={(e) =>
                    setPreferredHoursPerWeek(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
              </div>

              <div
                className="form-field"
                style={{ alignSelf: "flex-end", marginTop: "0.5rem" }}
              >
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? "Saving…" : "Save caregiver"}
                </button>
              </div>

              {error && (
                <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                  <p className="card-subtitle" style={{ color: "#fecaca" }}>
                    Error: {error}
                  </p>
                </div>
              )}
            </form>
          </div>
        </section>

        {/* Caregiver list */}
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Caregiver list</h2>
              <p className="card-subtitle">
                View max and preferred hours, contact info, and status.
              </p>
            </div>
          </div>

          <div className="card-body">
            {loading ? (
              <p className="card-subtitle">Loading caregivers…</p>
            ) : caregivers.length === 0 ? (
              <p className="card-subtitle">No caregivers yet.</p>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th className="text-right">Max hrs / wk</th>
                      <th className="text-right">Pref hrs / wk</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {caregivers.map((cg) => {
                      const fullName = `${cg.first_name || ""} ${
                        cg.last_name || ""
                      }`.trim();
                      const status = (cg.status || "").toLowerCase();

                      const badgeClass =
                        status === "active"
                          ? "badge badge--success"
                          : status === "inactive"
                          ? "badge badge--danger"
                          : "badge";

                      return (
                        <tr key={cg.id}>
                          <td>{fullName || "-"}</td>
                          <td>{cg.email || "-"}</td>
                          <td>{cg.phone || "-"}</td>
                          <td className="text-right">
                            {cg.max_weekly_hours ?? "-"}
                          </td>
                          <td className="text-right">
                            {cg.preferred_hours_per_week ?? "-"}
                          </td>
                          <td>
                            {cg.status ? (
                              <span className={badgeClass}>
                                {cg.status}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </SignedIn>
    </main>
  );
}
