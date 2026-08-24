import { apiClient } from "@/libs/api";
import Link from "next/link";

export default function Navigation() {
  return (
    <header className="border-b border-b-gray-300 shadow bg-gray-100">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/dashboard" className="text-xl font-semibold">Hotel Platform</Link>
        <button
          onClick={() => {
            apiClient.removeToken();
            window.location.href = "/login";
          }}
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
