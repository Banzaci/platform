"use client";

import { useEffect, useState } from "react";

export default function DevLabelToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const value = localStorage.getItem(
      "show-dev-labels"
    );

    setEnabled(value !== "false");
  }, []);

  function toggle() {
    const next = !enabled;

    setEnabled(next);

    localStorage.setItem(
      "show-dev-labels",
      String(next)
    );

    window.dispatchEvent(
      new Event("dev-labels-change")
    );
  }

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed bottom-4 right-4 z-[999999] rounded-lg bg-fuchsia-600 px-3 py-2 text-xs font-medium text-white shadow-lg"
    >
      {enabled
        ? "Hide labels"
        : "Show labels"}
    </button>
  );
}