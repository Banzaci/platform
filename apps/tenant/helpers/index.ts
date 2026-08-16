export function getShadow(shadow?: "none" | "sm" | "md" | "lg") {
  switch (shadow) {
    case "none":
      return "none";

    case "md":
      return "0 4px 12px rgba(0,0,0,0.12)";

    case "lg":
      return "0 10px 30px rgba(0,0,0,0.18)";

    case "sm":
    default:
      return "0 1px 3px rgba(0,0,0,0.10)";
  }
}

export function getGridClass(columns?: number) {
  switch (columns) {
    case 1:
      return "grid grid-cols-1";

    case 3:
      return "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3";

    case 4:
      return "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4";

    case 2:
    default:
      return "grid grid-cols-1 md:grid-cols-2";
  }
}