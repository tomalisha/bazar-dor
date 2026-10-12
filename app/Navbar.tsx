
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  image: string;
  unit: string;
  today: number;
  change?: { dir: "up" | "down" | "flat"; pct: number };
  yesterday: number;
};

type AuthUser = {
  name?: string;
  email?: string;
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
  }).format(value);

function getChange(product: Product) {
  if (product.change) return product.change;

  const today = Number(product.today) || 0;
  const yesterday = Number(product.yesterday) || 0;
  const pct = yesterday > 0 ? ((today - yesterday) / yesterday) * 100 : 0;

  return {
    dir: pct > 0 ? "up" : pct < 0 ? "down" : "flat",
    pct: Math.abs(pct),
  } as const;
}

export default function Navbar() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [date, setDate] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setDate(
      new Intl.DateTimeFormat("bn-BD", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date())
    );

    fetch(`${API_URL}/categories`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Category request failed");
        return res.json();
      })
      .then((data) => setCategories(getList<Category>(data)))
      .catch(() => setCategories([]));

    fetch(`${API_URL}/products`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Product request failed");
        return res.json();
      })
      .then((data) => setProducts(getList<Product>(data)))
      .catch(() => setProducts([]));

    fetch("/api/auth/get-session", {
      credentials: "include",
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  async function handleSignOut() {
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      window.location.href = "/";
    }
  }

  const tickerProducts = products.filter(
    (product) => product.nameBn && Number.isFinite(Number(product.today))
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8e3d8] bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-3xl">🛒</span>
          <span className="font-extrabold text-[#245c3a]">
            <span className="block text-2xl">বাজার দর</span>
            <span className="mt-1 block text-xs font-medium text-gray-500">
              {date || "বাংলাদেশের বাজারদর"}
            </span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          {!authLoading &&
            (user ? (
              <>
                <Link
                  href="/profile"
                  className="rounded-lg border border-[#245c3a] px-3 py-2 text-[#245c3a]"
                >
                  {user.name || user.email || "প্রোফাইল"}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                >
                  লগআউট
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="rounded-lg border border-[#245c3a] px-3 py-2 text-[#245c3a]"
                >
                  সাইন ইন
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-[#245c3a] px-3 py-2 text-white hover:bg-[#19472c]"
                >
                  সাইন আপ
                </Link>
              </>
            ))}
        </div>
      </div>

      <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 sm:px-5">
        <Link
          href="/"
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
            pathname === "/"
              ? "bg-[#245c3a] text-white"
              : "bg-[#edf4e8] text-[#245c3a] hover:bg-[#dcebd6]"
          }`}
        >
          হোম
        </Link>

        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              pathname === `/category/${category.slug}`
                ? "bg-[#245c3a] text-white"
                : "bg-[#edf4e8] text-[#245c3a] hover:bg-[#dcebd6]"
            }`}
          >
            {category.icon} {category.nameBn}
          </Link>
        ))}
      </nav>

      <div className="overflow-hidden bg-[#245c3a] py-2 text-white">
        {tickerProducts.length > 0 ? (
          <>
            <style jsx>{`
              @keyframes bazarTicker {
                from { transform: translateX(0); }
                to { transform: translateX(-50%); }
              }
              .bazar-ticker {
                display: flex;
                width: max-content;
                animation: bazarTicker 45s linear infinite;
              }
              .bazar-ticker:hover {
                animation-play-state: paused;
              }
            `}</style>
            <div className="bazar-ticker">
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  className="flex shrink-0 items-center gap-7 px-4"
                >
                  {tickerProducts.map((product) => {
                    const change = getChange(product);
                    const up = change.dir === "up";
                    const down = change.dir === "down";

                    return (
                      <Link
                        key={`${copy}-${product.id}`}
                        href={`/product/${product.slug}`}
                        className="whitespace-nowrap text-sm"
                      >
                        <span>{product.image} {product.nameBn}</span>
                        <span className="mx-2 font-bold">
                          ৳{taka(Number(product.today) || 0)}/{product.unit}
                        </span>
                        <span
                          className={
                            up
                              ? "text-green-200"
                              : down
                                ? "text-red-200"
                                : "text-gray-200"
                          }
                        >
                          {up ? "▲" : down ? "▼" : "—"}
                          {taka(change.pct)}%
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="px-5 text-sm">
            🛒 আজকের বাজারদর — প্রয়োজনীয় পণ্যের দাম এক নজরে
          </p>
        )}
      </div>
    </header>
  );
}
