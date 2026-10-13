"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function UpdateProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/signin");
      return;
    }

    if (session?.user) {
      setName(session.user.name || "");
    }
  }, [isPending, session, router]);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setMessage("নাম লিখো।");
      setSuccess(false);
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const { error } = await authClient.updateUser({
        name: trimmedName,
      });

      if (error) {
        setMessage(error.message || "নাম আপডেট করা যায়নি।");
        setSuccess(false);
        return;
      }

      setMessage("তোমার নাম সফলভাবে আপডেট হয়েছে!");
      setSuccess(true);
    } catch {
      setMessage("সমস্যা হয়েছে। আবার চেষ্টা করো।");
      setSuccess(false);
    } finally {
      setSaving(false);
    }
  }

  if (isPending || !session?.user) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#faf8f2]">
        <p className="font-semibold text-[#245c3a]">
          Account লোড হচ্ছে...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-[#faf8f2] px-5 py-12">
      <div className="mx-auto max-w-lg">
        <section className="rounded-3xl border border-[#e8e3d8] bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-extrabold text-[#245c3a]">
            Update Information
          </h1>

          <p className="mt-2 text-gray-600">
            তোমার account-এর নাম পরিবর্তন করো।
          </p>

          <form onSubmit={handleUpdate} className="mt-7 space-y-5">
            <div>
              <label htmlFor="name" className="mb-2 block font-semibold">
                নাম
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                className="w-full rounded-xl border border-[#d8dfd2] p-3 outline-none focus:border-[#245c3a] focus:ring-2 focus:ring-[#245c3a]/20"
                placeholder="তোমার নাম লিখো"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Email</label>
              <input
                type="email"
                value={session.user.email}
                readOnly
                className="w-full rounded-xl border bg-gray-100 p-3 text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Email এখানে পরিবর্তন করা যাবে না।
              </p>
            </div>

            {message && (
              <p
                role="status"
                className={`rounded-xl p-3 text-sm ${
                  success
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-[#245c3a] p-3 font-semibold text-white transition hover:bg-[#19472c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "আপডেট হচ্ছে..." : "Update Information"}
            </button>
          </form>

          <Link
            href="/profile"
            className="mt-5 block text-center font-medium text-[#245c3a] underline"
          >
            ← Profile-এ ফিরে যাও
          </Link>
        </section>
      </div>
    </main>
  );
}