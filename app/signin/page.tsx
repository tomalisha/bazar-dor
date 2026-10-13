
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");

  function showToast(message: string, type: "success" | "error") {
    setToast(message);
    setToastType(type);
  }

  async function handleSignin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setToast("");

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        showToast(error.message || "সাইন ইন করা যায়নি।", "error");
        return;
      }

      showToast("সাইন ইন সফল হয়েছে!", "success");
      window.setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch {
      showToast("সমস্যা হয়েছে। আবার চেষ্টা করো।", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialLogin(provider: "google" | "github") {
    setToast("");

    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });

      if (error) {
        showToast(error.message || "লগইন করা যায়নি।", "error");
      }
    } catch {
      showToast("লগইন করতে সমস্যা হয়েছে।", "error");
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      {toast && (
        <div
          role="status"
          className={`fixed right-5 top-5 z-50 rounded-xl px-5 py-3 text-white shadow-lg ${
            toastType === "success" ? "bg-green-700" : "bg-red-600"
          }`}
        >
          {toast}
        </div>
      )}

      <h1 className="mb-2 text-3xl font-bold">সাইন ইন</h1>
      <p className="mb-6 text-gray-600">
        তোমার Bazar-Dor অ্যাকাউন্টে প্রবেশ করো।
      </p>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-green-700 p-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "অপেক্ষা করুন..." : "সাইন ইন"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-300" />
        <span className="text-sm text-gray-500">অথবা</span>
        <div className="h-px flex-1 bg-gray-300" />
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          className="w-full rounded-xl border p-3 font-medium hover:bg-gray-50"
        >
          Google দিয়ে সাইন ইন
        </button>

        <button
          type="button"
          onClick={() => handleSocialLogin("github")}
          className="w-full rounded-xl border p-3 font-medium hover:bg-gray-50"
        >
          GitHub দিয়ে সাইন ইন
        </button>
      </div>

      <p className="mt-5 text-sm">
        অ্যাকাউন্ট নেই?{" "}
        <a className="text-green-700 underline" href="/signup">
          সাইন আপ
        </a>
      </p>
    </main>
  );
}
