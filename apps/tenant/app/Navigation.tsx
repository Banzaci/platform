/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";

export default function Navigation({ data }: { data: any }) {
  const { tenant } = data;
  const nav = tenant.theme.navigation;
  return (
    <nav
      style={{
          "--nav-bg": nav.backgroundColor,
          "--nav-text": nav.textColor,
          "--nav-hover": nav.hoverColor,
        } as React.CSSProperties
      }
      className="bg-(--nav-bg) text-(--nav-text)"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo / Hotel name */}
        <Link
          href="/"
          className="transition-colors hover:text-(--nav-hover)"
        >
          {tenant.logo_url ? (
          <img
            src={tenant.logo_url}
            alt={tenant.name}
            className="h-10 w-auto"
          />
        ) : (
          <span>{tenant.name}</span>
        )}
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