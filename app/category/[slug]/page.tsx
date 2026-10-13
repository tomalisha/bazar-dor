
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
  lastWeek?: number;
  lastMonth?: number;
  change?: {
    dir: "up" | "down" | "flat";
    pct: number;
  };
};

type SortOption = "default" | "low-high" | "high-low";

const API_URL = "https://api.abcz.workers.dev/api/bazardor";

function getList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;

    for (const key of ["data", "products", "result"]) {
      const nested = obj[key];

      if (Array.isArray(nested)) return nested as T[];

      if (nested && typeof nested === "object") {
        const found = getList<T>(nested);
        if (found.length) return found;
      }
    }
  }

  return [];
}

function getChange(product: Product) {
  if (product.change) {
    return {
      dir: product.change.dir,
      pct: Math.abs(Number(product.change.pct) || 0),
    };
  }

  const today = Number(product.today) || 0;
  const yesterday = Number(product.yesterday) || 0;
  const pct =
    yesterday > 0 ? ((today - yesterday) / yesterday) * 100 : 0;

  return {
    dir: pct > 0 ? "up" : pct < 0 ? "down" : "flat",
    pct: Math.abs(pct),
  } as const;
}

const taka = (value: number) =>
  new Intl.NumberFormat("bn-BD", {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const loadProducts = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/products`, {
        cache: "no-store",
        signal,
      });

      if (!response.ok) {
        throw new Error("পণ্যের তথ্য পাওয়া যায়নি।");
      }

      const result: unknown = await response.json();
      const allProducts = getList<Product>(result);

      const categoryProducts = allProducts.filter(
        (product) => product.category === slug
      );

      if (!categoryProducts.length) {
        setProducts([]);
      } else {
        setProducts(categoryProducts);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;

      setError("পণ্য লোড করা যায়নি। আবার চেষ্টা করো।");
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    const controller = new AbortController();

    loadProducts(controller.signal);

    return () => controller.abort();
  }, [loadProducts, retryCount]);

  const filteredProducts = products
    .filter((product) =>
      (product.nameBn || "")
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "low-high") {
        return Number(a.today) - Number(b.today);
      }

      if (sortBy === "high-low") {
        return Number(b.today) - Number(a.today);
      }

      return 0;
    });

  const category = products[0];

  return (
    <main className="min-h-screen bg-[#faf8f2] text-[#25291f]">
      <header className="border-b border-[#e8e3d8] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4">
          <a href="/" className="text-xl font-extrabold text-[#245c3a] sm:text-2xl">
            🛒 বাজার দর
          </a>

          <a
            href="/"
            className="rounded-lg bg-[#245c3a] px-4 py-2 font-semibold text-white hover:bg-[#19472c]"
          >
            হোম পেজ
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8">
        <a
          href="/"
          className="mb-6 inline-block font-semibold text-[#245c3a] hover:underline"
        >
          ← হোম পেজে ফিরে যাও
        </a>

        <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#245c3a] to-[#43804f] p-6 text-white shadow-sm sm:p-8">
          <p className="mb-2 text-sm text-green-100">বাজার দর / ক্যাটাগরি</p>

          <h1 className="text-3xl font-extrabold sm:text-4xl">
            {category?.categoryIcon || "🛍️"}{" "}
            {category?.categoryNameBn || "পণ্য ক্যাটাগরি"}
          </h1>

          <p className="mt-3 text-green-50">
            এই ক্যাটাগরির পণ্যের দাম এক জায়গায় দেখো।
          </p>
        </div>

        {!loading && !error && products.length > 0 && (
          <div className="mb-7 grid grid-cols-1 gap-5 rounded-2xl border border-[#e8e3d8] bg-white p-5 sm:grid-cols-2">
            <div>
              <label htmlFor="product-search" className="mb-2 block font-bold">
                পণ্য খুঁজুন
              </label>

              <input
                id="product-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="পণ্যের নাম লিখুন..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#43804f] focus:ring-2 focus:ring-[#43804f]/20"
              />
            </div>

            <div>
              <label htmlFor="sort-products" className="mb-2 block font-bold">
                Sort By / দাম অনুযায়ী সাজান
              </label>

              <select
                id="sort-products"
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value as SortOption)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#43804f] focus:ring-2 focus:ring-[#43804f]/20"
              >
                <option value="default">Default Sorting</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
              </select>
            </div>

            <p className="text-sm text-gray-500 sm:col-span-2">
              পাওয়া গেছে: {taka(filteredProducts.length)}টি পণ্য
            </p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-[#e8e3d8] bg-white p-5"
              >
                <div className="h-28 rounded-xl bg-[#e9e5dc]" />
                <div className="mt-5 h-5 w-2/3 rounded bg-[#e9e5dc]" />
                <div className="mt-3 h-4 w-1/2 rounded bg-[#e9e5dc]" />
                <div className="mt-5 h-8 w-1/3 rounded bg-[#e9e5dc]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-6 text-center text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="mt-4 rounded-lg bg-[#245c3a] px-5 py-3 font-semibold text-white hover:bg-[#19472c]"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-[#e8e3d8] bg-white p-8 text-center">
            <p className="text-gray-600">
              {search
                ? "এই নামে কোনো পণ্য পাওয়া যায়নি। অন্য নাম দিয়ে খুঁজুন।"
                : "এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।"}
            </p>

            {!search && (
              <a
                href="/"
                className="mt-4 inline-block rounded-lg bg-[#245c3a] px-5 py-3 font-bold text-white hover:bg-[#19472c]"
              >
                সব পণ্য দেখুন
              </a>
            )}
          </div>
        ) : (
          <>
            <h2 className="mb-5 text-2xl font-bold text-[#245c3a]">
              সব পণ্য ({taka(filteredProducts.length)})
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const change = getChange(product);

                return (
                  <a
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="group overflow-hidden rounded-2xl border border-[#e8e3d8] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#b8d0b8] hover:shadow-lg"
                  >
                    <div className="flex h-44 items-center justify-center bg-[#edf4e8]">
                      <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white text-6xl shadow-sm transition group-hover:scale-105">
                        {product.image || product.categoryIcon || "🛍️"}
                      </div>
                    </div>

                    <div className="p-5">
                      <span className="rounded-full bg-[#edf4e8] px-3 py-1 text-xs font-bold text-[#245c3a]">
                        {product.categoryNameBn}
                      </span>

                      <h3 className="mt-3 text-xl font-bold group-hover:text-[#43804f]">
                        {product.nameBn}
                      </h3>

                      <p className="mt-2 text-sm text-gray-500">
                        প্রতি {product.unit}
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-gray-500">আজকের দাম</p>
                          <p className="text-2xl font-extrabold text-[#245c3a]">
                            ৳{taka(Number(product.today) || 0)}
                          </p>
                        </div>

                        <span
                          className={`rounded-lg px-3 py-2 text-sm font-bold ${
                            change.dir === "up"
                              ? "bg-red-100 text-red-700"
                              : change.dir === "down"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {change.dir === "up"
                            ? "↑"
                            : change.dir === "down"
                              ? "↓"
                              : "→"}{" "}
                          {taka(change.pct)}%
                        </span>
                      </div>

                      <p className="mt-4 border-t border-gray-100 pt-3 text-sm text-gray-600">
                        গতকালের দাম:{" "}
                        <span className="font-bold text-gray-900">
                          ৳{taka(Number(product.yesterday) || 0)}
                        </span>
                      </p>

                      <p className="mt-3 font-bold text-[#245c3a]">
                        বিস্তারিত দেখো →
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </>
        )}
      </section>

      <footer className="mt-12 bg-[#193d29] px-5 py-6 text-center text-sm text-gray-300">
        বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে।
      </footer>
    </main>
  );
}
