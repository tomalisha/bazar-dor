"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AuthUser = {
  name?: string;
  email?: string;
};

export default function Navbar() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/get-session", {
      credentials: "include",
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth/sign-out", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/";
  }

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="text-2xl font-bold text-green-800">
          🛒 বাজার দর
        </Link>

        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
          <Link href="/">হোম</Link>

          {!loading &&
            (user ? (
              <>
                <Link href="/profile" className="text-green-800">
                  Profile
                </Link>
                <span>{user.name || user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/signin">Sign In</Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-green-700 px-4 py-2 text-white"
                >
                  Sign Up
                </Link>
              </>
            ))}
        </div>
      </nav>
    </header>
  );
}