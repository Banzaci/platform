"use client";
import { TenantResponse } from "@/types";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation({ tenant }: { tenant: TenantResponse }) {
  const theme = tenant.tenant.theme;
  const navigation = theme.navigation;
  const logoUrl = tenant.tenant.logo_url;
  const name = tenant.tenant.name;
  const pages = tenant.pages;
  const pathname = usePathname();
  return (
    <nav
      style={
        {
          fontSize: navigation?.fontSize,
          backgroundColor: navigation?.backgroundColor,
          fontFamily: navigation?.fontFamily,
          height: navigation?.height,

          "--nav-text": navigation?.textColor,
          "--nav-hover": navigation?.hoverColor,
          "--nav-active": navigation?.activeColor,
        } as React.CSSProperties & {
          "--nav-text"?: string;
          "--nav-hover"?: string;
          "--nav-active"?: string;
        }
      }
    >
      <div
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="transition-colors hover:text-(--nav-hover)"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={name}
              className="w-auto max-h-16"
            />
          ) : (
            <span>{name}</span>
          )}
        </Link>

        <div className="flex items-center gap-8">
          {pages.map((page: any) => {
            const href = page.slug === "index" ? "/" : `/${page.slug}`;
            const isActive = pathname === href;
            return (
              <Link
                key={page.id}
                href={href}
                className={`transition-colors hover:text-(--nav-hover) ${
                  isActive
                    ? "text-(--nav-active)"
                    : "text-(--nav-text)"
                }`}
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