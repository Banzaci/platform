type Props = {
  name: string;
  file: string;
};

export default function DevLabel({
  name,
  file,
}: Props) {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <a
      href={`vscode://file/${file}`}
      className="absolute left-2 top-2 z-50 rounded bg-fuchsia-600 px-2 py-1 font-mono text-[10px] text-white"
      title={`Open ${file} in VS Code`}
    >
      {name}
    </a>
  );
}