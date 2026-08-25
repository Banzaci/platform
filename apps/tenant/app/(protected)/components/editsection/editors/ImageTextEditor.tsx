/* eslint-disable @typescript-eslint/no-explicit-any */
import { Field } from "../../Field";
import ImageUpload from "../../ImageUpload";
import { inputClassName } from "../ThemeEditor";

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
    <div className="space-y-6">
        {/* Layout */}
        <Field label="Image position">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...content,
                  layout: "image-left",
                })
              }
              className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                content.layout === "image-left" || !content.layout
                  ? "border-gray-950 bg-gray-950 text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
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
              className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                content.layout === "image-right"
                  ? "border-gray-950 bg-gray-950 text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              Image right
            </button>
          </div>
        </Field>

        {/* Content */}
        <Field label="Heading">
          <input
            value={content.heading?.en ?? ""}
            onChange={(e) =>
              updateLocalized("heading", e.target.value)
            }
            className={inputClassName}
          />
        </Field>

        <Field label="Text">
          <textarea
            value={content.text?.en ?? ""}
            onChange={(e) =>
              updateLocalized("text", e.target.value)
            }
            rows={5}
            className={`${inputClassName} resize-none leading-6`}
          />
        </Field>

        <Field label="Image">
          <ImageUpload
            value={content.image}
            onChange={(image) =>
              onChange({
                ...content,
                image,
              })
            }
          />
        </Field>
    </div>
  );
}