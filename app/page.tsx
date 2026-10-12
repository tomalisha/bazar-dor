
"use client";

import { useEffect, useState } from "react";

type Category = {
  id?: number;
  slug: string;
  nameBn: string;
  icon: string;
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
  change?: {
    dir: "up" | "down" | "flat";
    pct: number;
  };
};

const API_URL = "https://api.abcz.workers.dev/api/bazardor";

function getList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;

    for (const key of ["data", "products", "categories", "result"]) {
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

const taka = (value: number) =>
  new Intl.NumberFormat("bn-BD", {
    maximumFractionDigits: 1,
  }).format(Number.isFinite(value) ? value : 0);

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

function ProductSection({
  id,
  title,
  subtitle,
  products,
}: {
  id: string;
  title: string;
  subtitle?: string;
  products: Product[];
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl scroll-mt-40 px-5 py-8 sm:py-10">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-[#245c3a] md:text-3xl">
          {title}
        </h2>
        {subtitle && <p className="mt-2 text-sm text-gray-500">{subtitle}</p>}
      </div>

      {products.length === 0 ? (
        <p className="rounded-xl bg-white p-5 text-gray-500">
          এই মুহূর্তে কোনো পণ্যের তথ্য নেই।
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const change = getChange(product);
            const up = change.dir === "up";
            const down = change.dir === "down";

            return (
              <a
                key={product.id}
                href={`/product/${product.slug}`}
                className="rounded-2xl border border-[#e8e3d8] bg-white p-5 transition hover:-translate-y-1 hover:border-[#b8d0b8] hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-4xl">{product.image || product.categoryIcon || "🛒"}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      up
                        ? "bg-green-100 text-green-800"
                        : down
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {up ? "▲" : down ? "▼" : "—"}
                    {taka(change.pct)}%
                  </span>
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  {product.categoryIcon} {product.categoryNameBn}
                </p>
                <h3 className="mt-1 text-lg font-bold text-[#25291f]">
                  {product.nameBn}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  প্রতি {product.unit}
                </p>

                <div className="mt-5 flex items-end justify-between gap-2 border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-sm text-gray-500">আজকের দাম</p>
                    <p className="mt-1 text-xl font-extrabold text-[#245c3a]">
                      {taka(Number(product.today) || 0)} টাকা
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#43804f]">
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

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          fetch(`${API_URL}/categories`, { cache: "no-store" }),
          fetch(`${API_URL}/products`, { cache: "no-store" }),
        ]);

        if (!categoryResponse.ok || !productResponse.ok) {
          throw new Error("API থেকে তথ্য লোড করা যায়নি।");
        }

        const [categoryJson, productJson]: [unknown, unknown] =
          await Promise.all([
            categoryResponse.json(),
            productResponse.json(),
          ]);

        const categoryList = getList<Category>(categoryJson);
        const productList = getList<Product>(productJson);

        if (!productList.length) {
          throw new Error("API থেকে কোনো product পাওয়া যায়নি।");
        }

        setCategories(categoryList);
        setProducts(productList);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "তথ্য লোড করা যায়নি।"
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const query = search.trim().toLowerCase();

  const filteredProducts = products.filter((product) =>
    [
      product.nameBn,
      product.category,
      product.categoryNameBn,
      product.slug,
      product.unit,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query)
  );

  const rising = [...filteredProducts]
    .filter((product) => getChange(product).dir === "up")
    .sort((a, b) => getChange(b).pct - getChange(a).pct)
    .slice(0, 6);

  const falling = [...filteredProducts]
    .filter((product) => getChange(product).dir === "down")
    .sort((a, b) => getChange(b).pct - getChange(a).pct)
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-[#faf8f2] text-[#25291f]">
      <section className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 md:grid-cols-2 md:py-14">
        <div>
          <p className="mb-4 font-bold text-[#43804f]">
            আপনার প্রতিদিনের বাজার সহকারী
          </p>
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
            বাজারের সঠিক হিসাব,
            <span className="mt-2 block text-[#43804f]">
              থাকুন এক ধাপ এগিয়ে।
            </span>
          </h1>
          <p className="mt-5 max-w-lg leading-8 text-gray-600">
            চাল, ডাল, তেল, মাছ, মাংসসহ নিত্যপ্রয়োজনীয় পণ্যের
            আজকের দাম দেখুন এক জায়গায়। বাজার করার আগে জেনে নিন আজকের দর।
          </p>
          <a
            href="#সব-পণ্য"
            className="mt-7 inline-flex rounded-xl bg-[#245c3a] px-6 py-3 font-bold text-white transition hover:bg-[#19472c]"
          >
            আজকের দাম দেখুন ↓
          </a>
        </div>

        <div className="relative min-h-72 overflow-hidden rounded-3xl bg-[#e9efdf] shadow-lg md:min-h-[390px]">
          <img
            src="/bazar-hero.png"
            alt="বাজার দর"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
            <p className="text-2xl font-extrabold">
              প্রতিদিনের বাজার, এখন আরও সহজ
            </p>
            <p className="mt-2 text-sm text-white/90">
              বাজার করার আগে জেনে নিন আজকের দর।
            </p>
          </div>
        </div>
      </section>

      <section id="ক্যাটাগরি" className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-6">
          <p className="text-sm font-bold text-[#43804f]">সহজে খুঁজে নিন</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[#245c3a] md:text-3xl">
            পণ্য ক্যাটাগরি
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-2xl bg-[#e9e5dc]" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <a
                key={category.slug}
                href={`/category/${category.slug}`}
                className="flex flex-col items-center justify-center rounded-2xl border border-[#e8e3d8] bg-white p-5 text-center transition hover:-translate-y-1 hover:border-[#245c3a] hover:bg-[#edf4e8]"
              >
                <span className="text-4xl">{category.icon}</span>
                <h3 className="mt-3 font-bold text-[#245c3a]">
                  {category.nameBn}
                </h3>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">ক্যাটাগরি লোড করা যায়নি।</p>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6">
        <div className="rounded-2xl border border-[#e8e3d8] bg-white p-5 shadow-sm">
          <label
            htmlFor="product-search"
            className="mb-3 block text-xl font-extrabold text-[#245c3a]"
          >
            🔎 প্রয়োজনীয় পণ্য খুঁজুন
          </label>
          <input
            id="product-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="চাল, ডাল, তেল লিখে খুঁজুন..."
            className="w-full rounded-xl border border-[#d8e2d4] bg-[#fafcf8] px-4 py-3 outline-none focus:border-[#43804f] focus:ring-2 focus:ring-[#43804f]/20"
          />
          <p className="mt-2 text-sm text-gray-500">
            {loading
              ? "পণ্যের তথ্য লোড হচ্ছে..."
              : `মোট ${taka(filteredProducts.length)}টি পণ্য`}
          </p>
        </div>
      </section>

      {loading ? (
        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-5 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-52 animate-pulse rounded-2xl bg-[#e9e5dc]" />
          ))}
        </section>
      ) : error ? (
        <section className="mx-auto max-w-7xl px-5 py-12 text-center">
          <p className="font-semibold text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-[#245c3a] px-5 py-3 font-semibold text-white"
          >
            আবার চেষ্টা করুন
          </button>
        </section>
      ) : (
        <>
          {!query && (
            <>
              <ProductSection
                id="দাম-বাড়ছে"
                title="আজ দাম বেড়েছে ▲"
                subtitle="যেসব পণ্যের দামে আজ বৃদ্ধি দেখা যাচ্ছে"
                products={rising}
              />
              <ProductSection
                id="দাম-কমছে"
                title="আজ দাম কমেছে ▼"
                subtitle="যেসব পণ্যের দামে আজ হ্রাস দেখা যাচ্ছে"
                products={falling}
              />
            </>
          )}

          <ProductSection
            id="সব-পণ্য"
            title={query ? "সার্চের ফলাফল" : "সব পণ্য"}
            subtitle={query ? "আপনার খোঁজার সঙ্গে মিলে যাওয়া পণ্য" : "নিত্যপ্রয়োজনীয় সব পণ্যের আজকের দাম এক জায়গায়"}
            products={filteredProducts}
          />
        </>
      )}

      <footer className="mt-12 bg-[#193d29] px-5 py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm md:flex-row">
          <p>বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে।</p>
          <p className="text-gray-300">
            সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে পরিবর্তিত হয়।
          </p>
        </div>
      </footer>
    </main>
  );
}
