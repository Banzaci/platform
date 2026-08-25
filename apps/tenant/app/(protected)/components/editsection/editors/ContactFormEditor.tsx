/* eslint-disable @typescript-eslint/no-explicit-any */
type Props = {
  content: {
    heading?: {
      en?: string;
    };
    submitLabel?: {
      en?: string;
    };
    successMessage?: {
      en?: string;
    };
    [key: string]: any;
  };
  onChange: (content: any) => void;
};

export default function ContactFormEditor({
  content,
  onChange,
}: Props) {
  function updateLocalized(
    key: "heading" | "submitLabel" | "successMessage",
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
        Contact form
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
            Submit button
          </span>

          <input
            value={content.submitLabel?.en ?? ""}
            placeholder="Send message"
            onChange={(e) =>
              updateLocalized("submitLabel", e.target.value)
            }
            className="w-full rounded-lg border px-4 py-3"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Success message
          </span>

          <textarea
            value={content.successMessage?.en ?? ""}
            placeholder="Thank you. We will get back to you soon."
            onChange={(e) =>
              updateLocalized("successMessage", e.target.value)
            }
            rows={3}
            className="w-full rounded-lg border px-4 py-3"
          />
        </label>
      </div>
    </div>
  );
}