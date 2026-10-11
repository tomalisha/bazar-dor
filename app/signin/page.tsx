
"use client";

import { useState } from "react";

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setMessage(data.message || data.error?.message || "সাইন ইন হয়নি");
      } else {
        window.location.href = "/";
      }
    } catch {
      setMessage("আবার চেষ্টা করো।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-6 text-3xl font-bold">সাইন ইন</h1>

      <form onSubmit={handleSignin} className="space-y-4">
        <input
          className="w-full rounded-xl border p-3"
          type="email"
          placeholder="ইমেইল"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full rounded-xl border p-3"
          type="password"
          placeholder="পাসওয়ার্ড"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {message && <p className="text-red-600">{message}</p>}

        <button
          className="w-full rounded-xl bg-green-700 p-3 font-semibold text-white"
          disabled={loading}
        >
          {loading ? "অপেক্ষা করুন..." : "সাইন ইন"}
        </button>
      </form>

      <p className="mt-5 text-sm">
        অ্যাকাউন্ট নেই?{" "}
        <a className="text-green-700 underline" href="/signup">
          সাইন আপ
        </a>
      </p>
    </main>
  );
}
