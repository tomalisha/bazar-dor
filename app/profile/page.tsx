"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/signin");
    }
  }, [isPending, session, router]);

  if (isPending || !session?.user) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#faf8f2]">
        <p className="font-semibold text-[#245c3a]">
          Profile লোড হচ্ছে...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-[#faf8f2] px-5 py-12">
      <div className="mx-auto max-w-lg">
        <section className="rounded-3xl border border-[#e8e3d8] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#e9efdf] text-3xl">
            👤
          </div>

          <h1 className="text-3xl font-extrabold text-[#245c3a]">
            My Profile
          </h1>

          <p className="mt-2 text-gray-600">
            তোমার account information এখানে দেখতে পারবে।
          </p>

          <div className="mt-7 space-y-4">
            <div className="rounded-xl border border-[#e8e3d8] p-4">
              <p className="text-sm text-gray-500">নাম</p>
              <p className="mt-1 font-semibold text-gray-900">
                {session.user.name || "নাম দেওয়া নেই"}
              </p>
            </div>

            <div className="rounded-xl border border-[#e8e3d8] p-4">
              <p className="text-sm text-gray-500">Email</p>
              <p className="mt-1 break-all font-semibold text-gray-900">
                {session.user.email}
              </p>
            </div>
          </div>

          <Link
            href="/profile/update"
            className="mt-6 block w-full rounded-xl bg-[#245c3a] px-5 py-3 text-center font-semibold text-white transition hover:bg-[#19472c]"
          >
            Update Information
          </Link>

          <Link
            href="/"
            className="mt-4 block text-center font-medium text-[#245c3a] underline"
          >
            ← হোম পেজে ফিরে যাও
          </Link>
        </section>
      </div>
    </main>
  );
}