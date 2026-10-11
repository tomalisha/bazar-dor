"use client";

import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server response পাওয়া যায়নি। Terminal check করো।");
      }

      if (!response.ok || data.error) {
        setMessage(
          data.message || data.error?.message || "Signup failed"
        );
      } else {
        window.location.href = "/signin";
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-6 text-3xl font-bold">অ্যাকাউন্ট তৈরি করুন</h1>

      <form onSubmit={handleSignup} className="space-y-4">
        <input
          className="w-full rounded-xl border p-3"
          placeholder="নাম"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
          placeholder="পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />

        {message && <p className="text-red-600">{message}</p>}

        <button
          className="w-full rounded-xl bg-green-700 p-3 font-semibold text-white disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "অপেক্ষা করুন..." : "সাইন আপ"}
        </button>
      </form>

      <p className="mt-5 text-sm">
        অ্যাকাউন্ট আছে?{" "}
        <a className="text-green-700 underline" href="/signin">
          সাইন ইন
        </a>
      </p>
    </main>
  );
}