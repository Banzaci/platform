/* eslint-disable @typescript-eslint/no-explicit-any */
import ImageUpload from "../../ImageUpload";

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
      <div>
        <label className="mb-2 block text-sm font-medium">
          Image position
        </label>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() =>
              onChange({
                ...content,
                layout: "image-left",
              })
            }
            className={`rounded-xl border px-4 py-3 text-sm font-medium ${
              content.layout === "image-left" ||
              !content.layout
                ? "border-black bg-black text-white"
                : "border-gray-200 bg-white text-gray-700"
            }`}
          >
            Image left
          </button>

          <button
            type="button"
            onClick={() =>
              onChange({
                ...content,
                layout: "image-right",
              })
            }
            className={`rounded-xl border px-4 py-3 text-sm font-medium ${
              content.layout === "image-right"
                ? "border-black bg-black text-white"
                : "border-gray-200 bg-white text-gray-700"
            }`}
          >
            Image right
          </button>
        </div>
      </div>
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
            Uplaod image
          </span>
          <ImageUpload
            value={content.image}
            onChange={(image) =>
              onChange({
                ...content,
                image,
              })
            }
          />
        </label>
      </div>
    </div>
  );
}