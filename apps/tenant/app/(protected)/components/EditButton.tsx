"use client";

import { Pencil } from "lucide-react";

type Props = {
  onClick: () => void;
  label?: string;
  className?: string;
};

export default function EditButton({
  onClick,
  label = "Edit",
  className = "",
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        absolute right-4 top-4 z-30
        flex cursor-pointer items-center gap-2
        rounded-full bg-black/90
        px-4 py-2
        text-sm font-medium text-white
        opacity-0 shadow-lg backdrop-blur
        transition
        hover:bg-black
        group-hover:opacity-100
        ${className}
      `}
    >
      <Pencil className="h-4 w-4" />
      {label}
    </button>
  );
}