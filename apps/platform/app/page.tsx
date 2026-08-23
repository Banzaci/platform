import Link from "next/link";
import {
  ArrowRight,
  Check,
  Globe2,
  LayoutTemplate,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight"
          >
            HotelBuilder
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-black"
            >
              Log in
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-36">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              <Sparkles className="h-4 w-4" />
              Built for hotels, guesthouses and rentals
            </div>

            <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
              Your hotel website.
              <br />
              Live in minutes.
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-500 md:text-xl">
              Create a beautiful hotel website, add your rooms,
              manage bookings and publish your own domain — without
              writing a single line of code.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Create your hotel website
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#how-it-works"
                className="rounded-xl border border-slate-200 px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                See how it works
              </a>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              No developer. No complicated setup. Just your hotel.
            </p>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-y border-slate-100 bg-slate-50"
      >
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              From idea to website in a few clicks
            </h2>

            <p className="mt-3 text-slate-500">
              Everything you need to get your hotel online.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Feature
              icon={<LayoutTemplate className="h-5 w-5" />}
              number="01"
              title="Create your hotel"
              text="Add your hotel name, description and the pages you want."
            />

            <Feature
              icon={<Sparkles className="h-5 w-5" />}
              number="02"
              title="Customize your site"
              text="Change colors, text, images and layout directly from your dashboard."
            />

            <Feature
              icon={<Globe2 className="h-5 w-5" />}
              number="03"
              title="Go live"
              text="Publish instantly on your own hotel subdomain or connect your custom domain."
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Everything in one place
            </p>

            <h2 className="text-4xl font-semibold tracking-tight">
              More than just a website.
            </h2>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-500">
              Manage your website, rooms, bookings and guest
              experience from one simple platform.
            </p>
          </div>

          <div className="grid gap-4">
            <Benefit text="Beautiful responsive hotel website" />
            <Benefit text="Online booking and availability" />
            <Benefit text="Rooms, prices and property management" />
            <Benefit text="Custom pages, images and content" />
            <Benefit text="Your own subdomain or custom domain" />
            <Benefit text="No technical knowledge required" />
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl rounded-3xl bg-black px-8 py-16 text-center text-white md:px-16">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Your hotel deserves a better website.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Create your site, add your rooms and start taking
            bookings today.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-slate-100"
          >
            Build my hotel website
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <span>© 2026 HotelBuilder</span>

          <span>
            Websites and bookings made simple.
          </span>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  icon,
  number,
  title,
  text,
}: {
  icon: React.ReactNode;
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-7">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
          {icon}
        </div>

        <span className="text-sm font-medium text-slate-300">
          {number}
        </span>
      </div>

      <h3 className="mt-6 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 leading-7 text-slate-500">
        {text}
      </p>
    </div>
  );
}

function Benefit({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100">
        <Check className="h-4 w-4" />
      </div>

      <span className="font-medium">
        {text}
      </span>
    </div>
  );
}