type Props = {
  content: {
    heading?: {
      en?: string;
    };
    text?: {
      en?: string;
    };
    button?: {
      label?: {
        en?: string;
      };
      href?: string;
    };
    [key: string]: any;
  };
  onChange: (content: any) => void;
};

export default function CTAEditor({
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

  function updateButtonLabel(value: string) {
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
  }

  function updateButtonHref(value: string) {
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
        Call to action
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
            Button text
          </span>

          <input
            value={content.button?.label?.en ?? ""}
            onChange={(e) =>
              updateButtonLabel(e.target.value)
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
              updateButtonHref(e.target.value)
            }
            className="w-full rounded-lg border px-4 py-3"
          />
        </label>
      </div>
    </div>
  );
}