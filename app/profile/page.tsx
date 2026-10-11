"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/get-session", {
          credentials: "include",
          cache: "no-store",
        });
        const data = await response.json();

        if (!data?.user) {
          window.location.href = "/signin";
          return;
        }

        setName(data.user.name || "");
        setEmail(data.user.email || "");
      } catch {
        setMessage("Profile load হয়নি। আবার চেষ্টা করো।");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setMessage(data.message || data.error?.message || "Update failed");
      } else {
        setMessage("Profile সফলভাবে update হয়েছে!");
      }
    } catch {
      setMessage("Update হয়নি। আবার চেষ্টা করো।");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="p-10 text-center">Loading profile...</main>;
  }

  return (
    <main className="mx-auto w-full max-w-lg px-5 py-12">
      <h1 className="mb-2 text-3xl font-bold text-green-800">
        My Profile
      </h1>
      <p className="mb-8 text-gray-600">তোমার account information update করো।</p>

      <form onSubmit={handleUpdate} className="space-y-5 rounded-2xl border p-6 shadow-sm">
        <div>
          <label className="mb-2 block font-medium">নাম</label>
          <input
            className="w-full rounded-xl border p-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Email</label>
          <input
            className="w-full rounded-xl border bg-gray-100 p-3"
            value={email}
            readOnly
          />
        </div>

        {message && <p role="status" className="text-sm">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-green-700 p-3 font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Updating..." : "Update Profile"}
        </button>
      </form>

      <Link href="/" className="mt-6 inline-block text-green-700 underline">
        ← Home-এ ফিরে যাও
      </Link>
    </main>
  );
}