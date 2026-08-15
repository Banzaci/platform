import ImageUpload from "../../ImageUpload";

type Props = {
  content: any;
  tenantId: string;
  onChange: (content: any) => void;
};

export default function ImageTextEditor({
  content,
  tenantId,
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
            Uplaod image
          </span>
          <ImageUpload
            tenantId={tenantId}
            value={content.image}
            onChange={(url) =>
              onChange({
                ...content,
                image: url,
              })
            }
          />
        </label>
      </div>
    </div>
  );
}