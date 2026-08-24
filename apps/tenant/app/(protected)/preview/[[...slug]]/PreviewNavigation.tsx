"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type PreviewPage = {
  name: {
    en: string
  };
  slug: string;
};

type Props = {
  pages: PreviewPage[];
};

export default function PreviewNavigation({
  pages,
}: Props) {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <span className="font-semibold">
          Preview
        </span>

        <div className="flex items-center gap-8">
          {pages.map((page) => {
            const href = page.slug === "index" ? "/preview" : `/preview/${page.slug}`;
            const isActive = pathname === href;
            return (
              <Link
                key={page.slug}
                href={href}
                className={
                  isActive
                    ? "font-medium text-black"
                    : "font-medium text-gray-500 transition-colors hover:text-black"
                }
              >
                {page.name.en}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}