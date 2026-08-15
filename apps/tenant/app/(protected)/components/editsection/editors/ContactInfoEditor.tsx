type Props = {
  content: {
    address?: {
      en?: string;
    };
    phone?: {
      en?: string;
    };
    email?: {
      en?: string;
    };
    [key: string]: any;
  };
  onChange: (content: any) => void;
};

export default function ContactInfoEditor({
  content,
  onChange,
}: Props) {
  function update(
    key: "address" | "phone" | "email",
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
        Contact information
      </h3>

      <div className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Address
          </span>

          <input
            value={content.address?.en ?? ""}
            onChange={(e) =>
              update("address", e.target.value)
            }
            className="w-full rounded-lg border px-4 py-3"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Phone
          </span>

          <input
            value={content.phone?.en ?? ""}
            onChange={(e) =>
              update("phone", e.target.value)
            }
            className="w-full rounded-lg border px-4 py-3"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Email
          </span>

          <input
            type="email"
            value={content.email?.en ?? ""}
            onChange={(e) =>
              update("email", e.target.value)
            }
            className="w-full rounded-lg border px-4 py-3"
          />
        </label>
      </div>
    </div>
  );
}