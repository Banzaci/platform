/* eslint-disable @typescript-eslint/no-explicit-any */
type Props = {
  content: {
    heading?: {
      en?: string;
    };
    text?: {
      en?: string;
    };
    [key: string]: any;
  };
  tenantId: string;
  onChange: (content: any) => void;
};

export default function PropertyGridEditor({
  content,
  onChange,
}: Props) {
  function updateLocalized(
    key: "heading" | "text",
    value: string
  ) {
    onChange({
      ...content,
      [key]: {
        ...content[key],
        en: value,
      },
    });
  }

  return (
    <div className="space-y-5 text-black">
      <label className="block">
        <span className="mb-2 block text-sm font-medium">
          Heading
        </span>

        <input
          value={content.heading?.en ?? ""}
          onChange={(e) =>
            updateLocalized("heading", e.target.value)
          }
          className="w-full rounded-lg border px-4 py-3"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium">
          Text
        </span>

        <textarea
          value={content.text?.en ?? ""}
          onChange={(e) =>
            updateLocalized("text", e.target.value)
          }
          rows={4}
          className="w-full rounded-lg border px-4 py-3"
        />
      </label>
    </div>
  );
}