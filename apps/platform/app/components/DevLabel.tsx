"use client";

import { useEffect, useState } from "react";

type Props = {
  name: string;
  file: string;
};

export default function DevLabel({
  name,
  file,
}: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const value = localStorage.getItem(
      "show-dev-labels"
    );

    setVisible(value !== "false");

    function handleChange() {
      const next = localStorage.getItem(
        "show-dev-labels"
      );

      setVisible(next !== "false");
    }

    window.addEventListener(
      "dev-labels-change",
      handleChange
    );

    return () => {
      window.removeEventListener(
        "dev-labels-change",
        handleChange
      );
    };
  }, []);

  if (
    process.env.NODE_ENV !== "development" ||
    !visible
  ) {
    return null;
  }

  return (
    <a
      href={`vscode://file/${file}`}
      className="absolute left-2 top-2 z-50 rounded bg-fuchsia-600 px-2 py-1 font-mono text-[10px] text-white"
    >
      {name}
    </a>
  );
}