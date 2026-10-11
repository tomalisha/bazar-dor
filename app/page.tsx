
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

const API_URL =
  "https://openapi.programming-hero.com/api/bazardor";

const taka = (value: number) =>
  new Intl.NumberFormat("bn-BD").format(value);

function normalizeProducts(data: unknown): Product[] {
  if (Array.isArray(data)) {
    return data as Product[];
  }

  if (data && typeof data === "object") {
    const result = data as {
      products?: unknown;
      data?: unknown;
    };

    if (Array.isArray(result.products)) {
      return result.products as Product[];
    }

    if (Array.isArray(result.data)) {
      return result.data as Product[];
    }
  }

  return [];
}

const categories = [
  { slug: "chal", name: "চাল", icon: "🍚" },
  { slug: "dal", name: "ডাল", icon: "🫘" },
  { slug: "tel", name: "তেল", icon: "🛢️" },
  { slug: "sobji", name: "সবজি", icon: "🥬" },
  { slug: "mach", name: "মাছ", icon: "🐟" },
  { slug: "mangsho", name: "মাংস", icon: "🍗" },
  { slug: "dim-dui", name: "ডিম ও দুধ", icon: "🥛" },
  { slug: "mosla", name: "মসলা", icon: "🌶️" },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/products`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data: unknown = await response.json();
        const productList = normalizeProducts(data);

        if (productList.length === 0) {
          throw new Error(
            "API response-এ product list পাওয়া যায়নি।"
          );
        }

        setProducts(productList);
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === "AbortError"
        ) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "পণ্যের তথ্য লোড করা যায়নি।"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, []);

  const rising = products
    .filter((product) => product.change?.dir === "up")
    .sort((a, b) => b.change.pct - a.change.pct)
    .slice(0, 6);

  const falling = products
    .filter((product) => product.change?.dir === "down")
    .sort((a, b) => a.change.pct - b.change.pct)
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-[#faf8f2] text-[#25291f]">
      <header className="border-b border-[#e8e3d8] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/logo-icon.png"
              alt="Bazar-Dor logo"
              className="h-12 w-12 rounded-xl object-contain"
            />

            <span className="text-2xl font-extrabold text-[#245c3a]">
              বাজার দর
              <span className="mt-1 block text-xs font-normal text-gray-500">
                প্রতিদিনের বাজারের হিসাব
              </span>
            </span>
          </a>

          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <a href="#ক্যাটাগরি" className="hover:text-green-700">
              ক্যাটাগরি
            </a>
            <a href="#সব-পণ্য" className="hover:text-green-700">
              সব পণ্য
            </a>
            <a href="#দাম-বাড়ছে" className="hover:text-green-700">
              দাম বাড়ছে
            </a>
            <a href="#দাম-কমছে" className="hover:text-green-700">
              দাম কমছে
            </a>
          </nav>

          <div className="flex gap-2">
            <a
              href="/signin"
              className="rounded-lg border border-[#245c3a] px-4 py-2 text-sm font-semibold text-[#245c3a] transition hover:bg-green-50"
            >
              সাইন ইন
            </a>
            <a
              href="/signup"
              className="rounded-lg bg-[#245c3a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#19472c]"
            >
              সাইন আপ
            </a>
          </div>
        </div>

        <div className="overflow-hidden bg-[#245c3a] py-2 text-sm text-white">
          <p className="mx-auto max-w-7xl px-5">
            🛒 আজকের বাজারদর — প্রয়োজনীয় পণ্যের দাম এক নজরে
          </p>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 md:grid-cols-2 md:py-16">
        <div>
          <p className="mb-4 font-semibold text-[#43804f]">
            আপনার প্রতিদিনের বাজার সহকারী
          </p>

          <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
            বাজারের সঠিক হিসাব,
            <span className="block text-[#43804f]">
              থাকুন এক ধাপ এগিয়ে।
            </span>
          </h1>

          <p className="mt-5 max-w-lg leading-8 text-gray-600">
            চাল, ডাল, তেল, মাছ, মাংস ও নিত্যপ্রয়োজনীয়
            পণ্যের দাম দেখুন এক জায়গায়। বাজার করার আগে
            জেনে নিন আজকের দর।
          </p>

          <a
            href="#সব-পণ্য"
            className="mt-7 inline-block rounded-xl bg-[#245c3a] px-6 py-3 font-semibold text-white transition hover:bg-[#19472c]"
          >
            আজকের দাম দেখুন ↓
          </a>
        </div>

        <div className="relative min-h-72 overflow-hidden rounded-3xl bg-[#e9efdf] shadow-lg md:min-h-[420px]">
          <img
            src="/bazar-hero.png"
            alt="Bazar-Dor fresh market banner"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
            <p className="text-xl font-bold md:text-2xl">
              প্রতিদিনের বাজার, এখন আরও সহজ
            </p>
            <p className="mt-2 text-sm text-white/90">
              বাজার করার আগে জেনে নিন আজকের দর।
            </p>
          </div>
        </div>
      </section>

      <section
        id="ক্যাটাগরি"
        className="mx-auto max-w-7xl px-5 py-8"
      >
        <p className="text-sm font-semibold text-[#43804f]">
          সহজে খুঁজে নিন
        </p>

        <h2 className="mb-6 mt-2 text-2xl font-extrabold md:text-3xl">
          🛒 পণ্য খুঁজুন ক্যাটাগরি অনুযায়ী
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <a
              key={category.slug}
              href={`/category/${category.slug}`}
              className="group rounded-2xl border border-[#e8e3d8] bg-white p-5 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#245c3a] hover:bg-[#edf4e8] hover:shadow-lg"
            >
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf4e8] text-4xl transition group-hover:scale-110">
                {category.icon}
              </span>

              <h3 className="mt-3 font-bold text-[#245c3a] group-hover:text-[#43804f]">
                {category.name}
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                পণ্য দেখুন →
              </p>
            </a>
          ))}
        </div>
      </section>

      {loading ? (
        <section className="mx-auto max-w-7xl px-5 py-12">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-52 animate-pulse rounded-2xl bg-[#e9e5dc]"
              />
            ))}
          </div>

          <p className="mt-5 text-center text-gray-500">
            পণ্যের দাম লোড হচ্ছে...
          </p>
        </section>
      ) : error ? (
        <section className="mx-auto max-w-7xl px-5 py-12 text-center">
          <p className="font-semibold text-red-700">
            পণ্যের তথ্য লোড করা যায়নি।
          </p>

          <p className="mt-2 break-words text-sm text-gray-600">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-[#245c3a] px-5 py-3 font-semibold text-white transition hover:bg-[#19472c]"
          >
            আবার চেষ্টা করুন
          </button>
        </section>
      ) : (
        <>
          <ProductSection
            id="দাম-বাড়ছে"
            title="📈 যেসব পণ্যের দাম বাড়ছে"
            products={rising}
          />

          <ProductSection
            id="দাম-কমছে"
            title="📉 যেসব পণ্যের দাম কমছে"
            products={falling}
          />

          <ProductSection
            id="সব-পণ্য"
            title="🛍️ আজকের সব পণ্যের দাম"
            products={products}
          />
        </>
      )}

      <footer className="mt-12 bg-[#193d29] px-5 py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm md:flex-row">
          <p>
            বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে।
          </p>

          <p className="text-gray-300">
            সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে পরিবর্তিত হয়।
          </p>
        </div>
      </footer>
    </main>
  );
}

function ProductSection({
  id,
  title,
  products,
}: {
  id: string;
  title: string;
  products: Product[];
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-5 py-10">
      <h2 className="mb-6 text-2xl font-extrabold md:text-3xl">
        {title}
      </h2>

      {products.length === 0 ? (
        <p className="text-gray-500">
          এই মুহূর্তে কোনো পণ্যের তথ্য নেই।
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const direction = product.change?.dir ?? "flat";
            const percentage = Number(product.change?.pct ?? 0);

            return (
              <a
                key={product.id}
                href={`/product/${product.slug}`}
                className="rounded-2xl border border-[#e8e3d8] bg-white p-5 transition hover:-translate-y-1 hover:border-[#c6d9c6] hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-4xl">
                    {product.image}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      direction === "up"
                        ? "bg-red-100 text-red-700"
                        : direction === "down"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {direction === "up"
                      ? "▲"
                      : direction === "down"
                      ? "▼"
                      : "—"}{" "}
                    {taka(Math.abs(percentage))}%
                  </span>
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  {product.categoryIcon} {product.categoryNameBn}
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  {product.nameBn}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  প্রতি {product.unit}
                </p>

                <div className="mt-5 flex items-end justify-between border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      আজকের দাম
                    </p>

                    <p className="text-2xl font-extrabold text-[#245c3a]">
                      ৳{taka(product.today)}
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-[#43804f]">
                    বিস্তারিত →
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}
