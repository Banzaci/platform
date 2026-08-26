import { LoaderCircle } from "lucide-react";

type Props = {
  text?: string;
  color?: string;
};

export function PageLoader({
  text = "Loading...",
  color,
}: Props) {
  return (
    <div
      className="flex min-h-60 w-full flex-col items-center justify-center gap-3"
      style={{ color }}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-current/10 bg-current/5">
        <LoaderCircle className="h-5 w-5 animate-spin" />
      </div>

      <span className="text-sm font-medium opacity-70">
        {text}
      </span>
    </div>
  );
}