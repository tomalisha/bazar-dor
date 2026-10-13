
export default function Loading() {
  return (
    <main className="min-h-screen animate-pulse bg-[#faf8f2] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-3xl bg-[#e9efdf] p-6 sm:p-10">
          <div className="h-5 w-32 rounded bg-[#cbd9c0]" />
          <div className="mt-5 h-10 max-w-xl rounded-lg bg-[#cbd9c0]" />
          <div className="mt-3 h-5 max-w-md rounded bg-[#d7e2ce]" />
          <div className="mt-6 h-11 w-40 rounded-xl bg-[#b8cbaa]" />
        </section>

        <div className="mt-10 flex items-center justify-between gap-4">
          <div className="h-8 w-48 rounded-lg bg-[#dce5d4]" />
          <div className="h-8 w-24 rounded-lg bg-[#e8e3d8]" />
        </div>

        <section className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <article
              key={index}
              className="rounded-2xl border border-[#e8e3d8] bg-white p-5"
            >
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 rounded-xl bg-[#e4eadc]" />
                <div className="flex-1">
                  <div className="h-5 w-3/4 rounded bg-[#dce5d4]" />
                  <div className="mt-3 h-4 w-1/2 rounded bg-[#eeeae1]" />
                </div>
              </div>

              <div className="mt-6 h-7 w-2/3 rounded bg-[#dce5d4]" />
              <div className="mt-4 h-4 w-full rounded bg-[#eeeae1]" />
              <div className="mt-5 h-10 w-full rounded-xl bg-[#e4eadc]" />
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
