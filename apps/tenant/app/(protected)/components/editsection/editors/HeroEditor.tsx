/* eslint-disable @typescript-eslint/no-explicit-any */
import ImageUpload from "../../ImageUpload";

type Props = {
  content: any;
  onChange: (content: any) => void;
};

export default function HeroEditor({
  content,
  onChange,
}: Props) {
  function updateLocalized(key: "heading" | "text", value: string) {
    onChange({
      ...content,
      [key]: {
        ...content[key],
        en: value,
      },
    });
  }
  function updateButton(key: "label" | "href", value: string) {
    if (key === "label") {
      onChange({
        ...content,
        button: {
          ...content.button,
          label: {
            ...content.button?.label,
            en: value,
          },
        },
      });

      return;
    }

    onChange({
      ...content,
      button: {
        ...content.button,
        href: value,
      },
    });
  }

  return (
    <div className="text-black">
      <h3 className="mb-5 text-lg font-semibold">
        Hero content
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
        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Button text
          </span>

          <input
            value={content.button?.label?.en ?? ""}
            onChange={(e) =>
              updateButton("label", e.target.value)
            }
            className="w-full rounded-lg border px-4 py-3"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Button link
          </span>

          <input
            value={content.button?.href ?? ""}
            onChange={(e) =>
              updateButton("href", e.target.value)
            }
            className="w-full rounded-lg border px-4 py-3"
          />
        </label>
      </div>
    </div>
  );
}