type Props = {
  content: any;
  onChange: (content: any) => void;
};

export default function ImageTextEditor({
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
    <div className="text-black">
      <h3 className="mb-5 text-lg font-semibold">
        Image & text
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
            rows={5}
            className="w-full rounded-lg border px-4 py-3"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Image URL
          </span>

          <input
            value={content.image ?? ""}
            onChange={(e) =>
              onChange({
                ...content,
                image: e.target.value,
              })
            }
            className="w-full rounded-lg border px-4 py-3"
          />
        </label>
      </div>
    </div>
  );
}