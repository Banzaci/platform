/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";

export default function Navigation({ data }: { data: any }) {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo / Hotel name */}
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-gray-900"
        >
          {data.tenant.name}
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-8">
          {data.pages.map((page: any) => {
            const href = page.slug === "index" ? "/" : `/${page.slug}`;

            return (
              <Link
                key={page.id}
                href={href}
                className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
              >
                {page.name.en}
              </Link>
            );
          })}
          <Link
            href="/faq"
            className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            FAQ
          </Link>
        </div>
      </div>
    </nav>
  );
}