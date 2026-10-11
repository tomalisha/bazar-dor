
"use client";

import { useEffect, useState } from "react";

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
  change: {
    dir: "up" | "down" | "flat";
    pct: number;
  };
};

const API_URL = "https://openapi.programming-hero.com/api/bazardor";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    params.then(({ slug }) => {
      if (active) setSlug(slug);
    });

    return () => {
      active = false;
    };
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/products`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const result = await response.json();

        const data: Product[] = Array.isArray(result)
          ? result
          : result.products || result.data || [];

        setProducts(data.filter((product) => product.category === slug));
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError("পণ্য লোড করা যায়নি। আবার চেষ্টা করো।");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProducts();

    return () => controller.abort();
  }, [slug]);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-green-700 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-5">
          <a href="/" className="text-2xl font-extrabold">
            🛒 Bazar-Dor
          </a>
          <a
            href="/"
            className="rounded-lg bg-white px-4 py-2 font-bold text-green-800 hover:bg-green-100"
          >
            Home
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8">
        <button
          onClick={() => window.history.back()}
          className="mb-6 rounded-lg border border-gray-200 bg-white px-4 py-2 hover:bg-green-50"
        >
          ← ফিরে যাও
        </button>

        <div className="mb-8 rounded-2xl bg-gradient-to-r from-green-700 to-emerald-500 p-7 text-white shadow-lg">
          <p className="mb-2 text-sm text-green-100">BAZAR-DOR / CATEGORY</p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            {products[0]?.categoryIcon || "🛍️"}{" "}
            {products[0]?.categoryNameBn || slug}
          </h1>
          <p className="mt-2 text-green-50">
            বাজারের পণ্যের দাম এক জায়গায় দেখো।
          </p>
        </div>

        {loading ? (
          <p className="py-16 text-center text-lg font-bold text-green-700">
            পণ্য লোড হচ্ছে...
          </p>
        ) : error ? (
          <p className="rounded-xl bg-red-50 p-5 text-center text-red-700">
            {error}
          </p>
        ) : products.length === 0 ? (
          <p className="rounded-xl bg-yellow-50 p-8 text-center text-yellow-800">
            এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।
          </p>
        ) : (
          <>
            <h2 className="mb-5 text-2xl font-bold">
              সব পণ্য ({products.length})
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <a
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:shadow-xl"
                >
                  <div className="flex h-48 items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
                    <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-white/80 text-7xl shadow-md transition group-hover:scale-110">
                      {product.image || product.categoryIcon || "🛍️"}
                    </div>
                  </div>

                  <div className="p-5">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                      {product.categoryNameBn}
                    </span>

                    <h3 className="mt-3 text-xl font-bold group-hover:text-green-700">
                      {product.nameBn}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      প্রতি {product.unit}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-gray-500">আজকের দাম</p>
                        <p className="text-2xl font-extrabold text-green-700">
                          ৳{product.today}
                        </p>
                      </div>

                      <span
                        className={`rounded-lg px-3 py-2 text-sm font-bold ${
                          product.change.dir === "up"
                            ? "bg-red-100 text-red-700"
                            : product.change.dir === "down"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.change.dir === "up"
                          ? "↑"
                          : product.change.dir === "down"
                            ? "↓"
                            : "→"}{" "}
                        {product.change.pct}%
                      </span>
                    </div>

                    <p className="mt-4 border-t border-gray-100 pt-3 text-sm text-gray-600">
                      গতকালের দাম:{" "}
                      <span className="font-bold text-gray-900">
                        ৳{product.yesterday}
                      </span>
                    </p>

                    <p className="mt-3 font-bold text-green-700">
                      বিস্তারিত দেখো →
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </section>

      <footer className="mt-12 bg-gray-900 px-5 py-6 text-center text-sm text-gray-300">
        © Bazar-Dor — বাজারদর জানো, সচেতন থাকো।
      </footer>
    </main>
  );
}
