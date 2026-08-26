import { CircleAlert } from "lucide-react";

type Props = {
  title: string;
  text?: string;
  color?: string;
};

export function EmptyState({
  title,
  text,
  color,
}: Props) {
  return (
    <div
      className="flex min-h-60 w-full flex-col items-center justify-center gap-3 text-center"
      style={{ color }}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-current/10 bg-current/5">
        <CircleAlert className="h-5 w-5 opacity-70" />
      </div>

      <div>
        <p className="text-sm font-medium">
          {title}
        </p>

        {text && (
          <p className="mt-1 text-xs opacity-60">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}