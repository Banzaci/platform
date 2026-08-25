export function Field({
  label,
  overridden,
  onReset,
  children,
}: {
  label: string;
  overridden?: boolean;
  onReset?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {label}
        </span>

        {overridden && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-gray-400 transition hover:text-gray-900"
          >
            Use global
          </button>
        )}
      </div>
      {children}
    </div>
  );
}