import { apiClient } from "@/libs/api";

export default function Navigation() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <h1 className="text-xl font-semibold">Hotel Platform</h1>

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
