"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#faf8f2] px-5 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-[#e8e3d8] bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="text-7xl" aria-hidden="true">
          🛒
        </div>

        <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-[#43804f]">
          Error 404
        </p>

        <h1 className="mt-3 text-3xl font-extrabold text-[#245c3a] sm:text-4xl">
          পেজটি খুঁজে পাওয়া যায়নি!
        </h1>

        <p className="mt-4 leading-7 text-gray-600">
          দুঃখিত! তুমি যে পেজটি খুঁজছ, সেটি পাওয়া যাচ্ছে না।
          সঠিক লিংক দিয়ে আবার চেষ্টা করো অথবা হোম পেজে ফিরে যাও।
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#245c3a] px-6 py-3 font-semibold text-white transition hover:bg-[#19472c] focus:outline-none focus:ring-2 focus:ring-[#245c3a] focus:ring-offset-2"
        >
          ← হোম পেজে ফিরে যাও
        </Link>
      </section>
    </main>
  );
}