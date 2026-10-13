
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

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
  lastWeek?: number;
  lastMonth?: number;
  change?: {
    dir: "up" | "down" | "flat";
    pct: number;
  };
  markets?: Market[];
};

const API_URL = "https://api.abcz.workers.dev/api/bazardor";

function getProducts(data: unknown): Product[] {
  if (Array.isArray(data)) return data as Product[];

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    for (const key of ["data", "products", "result"]) {
      const nested = obj[key];

      if (Array.isArray(nested)) return nested as Product[];

      if (nested && typeof nested === "object") {
        const found = getProducts(nested);
        if (found.length) return found;
      }
    }
  }

  return [];
}

const taka = (value: number) =>
  new Intl.NumberFormat("bn-BD", {
    maximumFractionDigits: 2,
  }).format(value);

export default function ProductDetailsPage() {
  const { data: session, isPending } = authClient.useSession();
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const slug = params.slug;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/signin");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (isPending || !session?.user || !slug) return;

    const controller = new AbortController();

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/products`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("পণ্যের তথ্য পাওয়া যায়নি।");
        }

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
  }, [isPending, session, slug]);

  if (isPending || !session?.user) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#faf8f2] px-5">
        <p className="font-semibold text-[#245c3a]">
          Account যাচাই করা হচ্ছে...
        </p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#faf8f2]">
        <p className="font-semibold text-[#245c3a]">
          পণ্যের তথ্য লোড হচ্ছে...
        </p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-[#faf8f2] px-5 text-center">
        <span className="text-6xl">🛒</span>
        <h1 className="text-2xl font-extrabold text-[#245c3a]">
          {error || "পণ্য পাওয়া যায়নি"}
        </h1>
        <Link
          href="/"
          className="rounded-xl bg-[#245c3a] px-6 py-3 font-semibold text-white hover:bg-[#19472c]"
        >
          হোম পেজে ফিরে যান
        </Link>
      </main>
    );
  }

  const markets = product.markets ?? [];

  const prices = markets.flatMap((market) => [
    Number(market.min),
    Number(market.max),
  ]).filter((price) => Number.isFinite(price));

  const minimum = prices.length
    ? Math.min(...prices)
    : Number(product.today) || 0;

  const maximum = prices.length
    ? Math.max(...prices)
    : Number(product.today) || 0;

  const average = prices.length
    ? prices.reduce((sum, price) => sum + price, 0) / prices.length
    : Number(product.today) || 0;

  const change = product.change ?? {
    dir: product.today > product.yesterday
      ? "up"
      : product.today < product.yesterday
        ? "down"
        : "flat",
    pct: product.yesterday
      ? Math.abs(
          ((product.today - product.yesterday) / product.yesterday) * 100
        )
      : 0,
  };

  return (
    <main className="min-h-screen bg-[#faf8f2] px-4 py-8 text-[#25291f] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="font-bold text-[#245c3a]">
            🛒 বাজার দর
          </Link>
          <Link href="/" className="text-sm font-semibold text-[#245c3a]">
            ← হোম পেজ
          </Link>
        </div>

        <section className="rounded-3xl border border-[#e8e3d8] bg-white p-5 shadow-sm sm:p-8 md:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-[#e9efdf] text-5xl">
              {product.image || "🛍️"}
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-[#43804f]">
                {product.categoryIcon} {product.categoryNameBn}
              </p>
              <h1 className="text-3xl font-extrabold text-[#245c3a] sm:text-4xl">
                {product.nameBn}
              </h1>
              <p className="mt-2 text-gray-500">
                প্রতি {product.unit}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-[#edf3e7] p-5 sm:p-6">
            <p className="text-sm text-gray-600">আজকের দাম</p>
            <p className="mt-1 text-4xl font-extrabold text-[#245c3a]">
              ৳{taka(Number(product.today) || 0)}
            </p>
            <p
              className={`mt-3 text-sm font-semibold ${
                change.dir === "up"
                  ? "text-red-700"
                  : change.dir === "down"
                    ? "text-green-700"
                    : "text-gray-600"
              }`}
            >
              {change.dir === "up"
                ? "▲ দাম বেড়েছে"
                : change.dir === "down"
                  ? "▼ দাম কমেছে"
                  : "— দাম অপরিবর্তিত"}{" "}
              {taka(Math.abs(Number(change.pct) || 0))}%
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: "সর্বনিম্ন দাম", value: minimum },
              { label: "সর্বোচ্চ দাম", value: maximum },
              { label: "গড় দাম", value: average },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-[#e8e3d8] p-5"
              >
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="mt-2 text-xl font-bold text-[#245c3a]">
                  ৳{taka(item.value)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-9">
          <h2 className="mb-5 text-2xl font-extrabold text-[#245c3a]">
            🏪 বাজারভিত্তিক আজকের দাম
          </h2>

          {!markets.length ? (
            <div className="rounded-2xl border border-[#e8e3d8] bg-white p-6 text-gray-600">
              এই পণ্যের বাজারভিত্তিক দাম পাওয়া যায়নি।
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {markets.map((market, index) => (
                <article
                  key={`${market.market}-${index}`}
                  className="rounded-2xl border border-[#e8e3d8] bg-white p-5"
                >
                  <h3 className="font-bold text-[#245c3a]">
                    {market.market}
                  </h3>

                  {market.division && (
                    <p className="mt-1 text-sm text-gray-500">
                      {market.division}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-gray-500">
                      দামের পরিসর
                    </span>
                    <span className="font-bold text-[#245c3a]">
                      ৳{taka(Number(market.min))} – ৳{taka(Number(market.max))}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="mt-8 text-sm text-gray-500">
          বাজারের দাম স্থান ও সময় অনুযায়ী পরিবর্তিত হতে পারে।
        </p>
      </div>
    </main>
  );
}
