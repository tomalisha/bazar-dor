
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Market = {
  market: string;
  division?: string;
  min: number;
  max: number;
};

type Product = {
  id: number;
  slug: string;
  nameBn: string;
  category: string;
  categoryNameBn: string;
  categoryIcon: string;
  unit: string;
  image: string;
  today: number;
  yesterday: number;
  lastWeek: number;
  lastMonth: number;
  change: { dir: "up" | "down" | "flat"; pct: number };
  markets?: Market[];
};

const API_URL = "https://openapi.programming-hero.com/api/bazardor";

function getProducts(data: unknown): Product[] {
  if (Array.isArray(data)) return data as Product[];

  if (data && typeof data === "object") {
    const result = data as { products?: unknown; data?: unknown };
    if (Array.isArray(result.products)) return result.products as Product[];
    if (Array.isArray(result.data)) return result.data as Product[];
  }

  return [];
}

const taka = (value: number) =>
  new Intl.NumberFormat("bn-BD").format(value);

export default function ProductDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#faf8f2]">
          পণ্যের তথ্য লোড হচ্ছে...
        </main>
      }
    >
      <ProductDetails />
    </Suspense>
  );
}

function ProductDetails() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/products`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) throw new Error("পণ্যের তথ্য পাওয়া যায়নি।");

        const products = getProducts(await response.json());
        const found = products.find((item) => item.slug === slug);

        if (!found) {
          setProduct(null);
          setError("এই পণ্যটি খুঁজে পাওয়া যায়নি।");
        } else {
          setProduct(found);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError("পণ্যের তথ্য লোড করা যায়নি।");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProduct();
    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf8f2]">
        <p className="font-semibold text-[#245c3a]">পণ্যের তথ্য লোড হচ্ছে...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#faf8f2] px-5 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="text-2xl font-extrabold">
          {error || "পণ্য পাওয়া যায়নি"}
        </h1>
        <a href="/" className="rounded-xl bg-[#245c3a] px-6 py-3 font-semibold text-white">
          হোম পেজে ফিরে যান
        </a>
      </main>
    );
  }

  const markets = product.markets ?? [];
  const minimum = markets.length ? Math.min(...markets.map((m) => m.min)) : product.today;
  const maximum = markets.length ? Math.max(...markets.map((m) => m.max)) : product.today;

  return (
    <main className="min-h-screen bg-[#faf8f2] text-[#25291f]">
      <header className="border-b border-[#e8e3d8] bg-white px-5 py-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <a href="/" className="text-xl font-extrabold text-[#245c3a]">🛒 বাজার দর</a>
          <a href="/" className="text-sm font-semibold text-[#245c3a]">← হোম পেজ</a>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10">
        <section className="rounded-3xl border border-[#e8e3d8] bg-white p-6 shadow-sm md:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-[#e9efdf] text-6xl">
              {product.image}
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-[#43804f]">
                {product.categoryIcon} {product.categoryNameBn}
              </p>
              <h1 className="text-3xl font-extrabold md:text-4xl">{product.nameBn}</h1>
              <p className="mt-3 text-gray-500">প্রতি {product.unit}</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-[#edf3e7] p-6">
            <p className="text-sm text-gray-600">আজকের দাম</p>
            <p className="mt-1 text-4xl font-extrabold text-[#245c3a]">৳{taka(product.today)}</p>
            <p className={`mt-3 text-sm font-semibold ${product.change.dir === "up" ? "text-green-700" : product.change.dir === "down" ? "text-red-700" : "text-gray-600"}`}>
              {product.change.dir === "up" ? "▲ দাম বেড়েছে" : product.change.dir === "down" ? "▼ দাম কমেছে" : "— দাম অপরিবর্তিত"}{" "}
              {taka(Math.abs(product.change.pct))}%
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              ["সর্বনিম্ন দাম", minimum],
              ["সর্বোচ্চ দাম", maximum],
              ["গতকালের দাম", product.yesterday],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-xl border border-[#e8e3d8] p-5">
                <p className="text-sm text-gray-500">{label}</p>
                <p className="mt-2 text-xl font-bold text-[#245c3a]">৳{taka(Number(value))}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-extrabold">🏪 বাজারভিত্তিক আজকের দাম</h2>
          {!markets.length ? (
            <div className="rounded-2xl border border-[#e8e3d8] bg-white p-6 text-gray-600">
              এই পণ্যের বাজারভিত্তিক দাম পাওয়া যায়নি।
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {markets.map((market, index) => (
                <div key={`${market.market}-${index}`} className="rounded-2xl border border-[#e8e3d8] bg-white p-5">
                  <h3 className="font-bold">{market.market}</h3>
                  {market.division && <p className="mt-1 text-sm text-gray-500">{market.division}</p>}
                  <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                    <span className="text-gray-500">দামের পরিসর</span>
                    <span className="font-bold text-[#245c3a]">৳{taka(market.min)} – ৳{taka(market.max)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="mt-8 text-sm text-gray-500">বাজারের দাম স্থান ও সময় অনুযায়ী পরিবর্তিত হতে পারে।</p>
      </div>
    </main>
  );
}
