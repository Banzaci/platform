"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation({ data }: { data: any }) {
  const { tenant } = data;
  const pathname = usePathname();
  const nav = tenant.theme.navigation;
  return (
    <nav
      style={
        {
          "--nav-bg": nav.backgroundColor,
          "--nav-text": nav.textColor,
          "--nav-hover": nav.hoverColor,
          "--nav-active": nav.activeColor,
          "--nav-font": `"${nav.fontFamily}"`,
          "--nav-font-size": nav.fontSize,
          "--nav-height": nav.height,
          "--nav-logo-height": nav.logoHeight,
        } as React.CSSProperties
      }
      className="bg-(--nav-bg) text-(--nav-text)"
    >
      <div
        className="mx-auto flex max-w-7xl items-center justify-between px-6"
        style={{
          height: "var(--nav-height)",
          fontFamily: "var(--nav-font)",
          fontSize: "var(--nav-font-size)",
        }}
      >
        <Link
          href="/"
          className="transition-colors hover:text-(--nav-hover)"
        >
          {tenant.logo_url ? (
            <img
              src={tenant.logo_url}
              alt={tenant.name}
              style={{
                height: "var(--nav-logo-height)",
              }}
              className="w-auto"
            />
          ) : (
            <span>{tenant.name}</span>
          )}
        </Link>

        <div className="flex items-center gap-8">
          {data.pages.map((page: any) => {
            const href =
              page.slug === "index"
                ? "/"
                : `/${page.slug}`;

            const isActive =
              pathname === href;

            return (
              <Link
                key={page.id}
                href={href}
                style={{
                  color: isActive
                    ? "var(--nav-active)"
                    : "var(--nav-text)",
                }}
                className="font-medium transition-colors hover:text-(--nav-hover)"
              >
                {page.name.en}
              </Link>
            );
          })}

          <Link
            href="/faq"
            style={{
              color:
                pathname === "/faq"
                  ? "var(--nav-active)"
                  : "var(--nav-text)",
            }}
            className="font-medium transition-colors hover:text-(--nav-hover)"
          >
            FAQ
          </Link>
        </div>
      </div>
    </nav>
  );
}