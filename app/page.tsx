import Image from "next/image";
// page
export default function Home() {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 flex flex-col gap-8 items-center sm:items-start p-4">
        <Image
          className="dark:invert"
          src="https://nextjs.org/icons/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              app/page.tsx
            </code>
            .
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

      </main>
      <textarea className="w-full max-w-[95%] h-[20%] m-4 p-2 shadow-xl shadow-gray-900 border-2 border-lime-700 rounded bg-gray-800  text-orange-800 text-xl font-[family-name:var(--font-cascadia-code)]" placeholder="Enter text here..."></textarea>

    </div>
  );
}
