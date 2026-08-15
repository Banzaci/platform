type Props = {
  content: {
    heading?: {
      en?: string;
    };
    text?: {
      en?: string;
    };
    limit?: number;
    [key: string]: any;
  };
  onChange: (content: any) => void;
};

export default function RoomGridEditor({
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
    <div>
      <h3 className="mb-5 text-lg font-semibold">
        Room grid
      </h3>

      <div className="space-y-5">
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

        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Number of rooms to show
          </span>

          <input
            type="number"
            min={1}
            value={content.limit ?? 6}
            onChange={(e) =>
              onChange({
                ...content,
                limit: Number(e.target.value),
              })
            }
            className="w-full rounded-lg border px-4 py-3"
          />
        </label>
      </div>
    </div>
  );
}