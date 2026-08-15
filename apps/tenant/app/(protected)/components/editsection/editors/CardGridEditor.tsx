type CardItem = {
  image?: string;
  title?: {
    en?: string;
  };
  text?: {
    en?: string;
  };
};

type Props = {
  content: {
    heading?: {
      en?: string;
    };
    items?: CardItem[];
    [key: string]: any;
  };
  tenantId: string;
  onChange: (content: any) => void;
};

export default function CardGridEditor({
  content,
  tenantId,
  onChange,
}: Props) {
  const items = content.items ?? [];

  function updateHeading(value: string) {
    onChange({
      ...content,
      heading: {
        ...content.heading,
        en: value,
      },
    });
  }

  function updateItem(
    index: number,
    key: "image" | "title" | "text",
    value: string
  ) {
    const nextItems = items.map((item, i) => {
      if (i !== index) return item;

      if (key === "image") {
        return {
          ...item,
          image: value,
        };
      }

      return {
        ...item,
        [key]: {
          ...item[key],
          en: value,
        },
      };
    });

    onChange({
      ...content,
      items: nextItems,
    });
  }

  function addItem() {
    onChange({
      ...content,
      items: [
        ...items,
        {
          image: "",
          title: {
            en: "",
          },
          text: {
            en: "",
          },
        },
      ],
    });
  }

  function removeItem(index: number) {
    onChange({
      ...content,
      items: items.filter((_, i) => i !== index),
    });
  }

  return (
    <div>
      <h3 className="mb-5 text-lg font-semibold">
        Cards
      </h3>

      <label className="mb-6 block">
        <span className="mb-2 block text-sm font-medium">
          Heading
        </span>

        <input
          value={content.heading?.en ?? ""}
          onChange={(e) => updateHeading(e.target.value)}
          className="w-full rounded-lg border px-4 py-3"
        />
      </label>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium">
                Card {index + 1}
              </span>

              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-sm text-red-600"
              >
                Remove
              </button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs text-gray-500">
                  Image URL
                </span>

                <input
                  value={item.image ?? ""}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "image",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-gray-500">
                  Title
                </span>

                <input
                  value={item.title?.en ?? ""}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "title",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-gray-500">
                  Text
                </span>

                <textarea
                  value={item.text?.en ?? ""}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "text",
                      e.target.value
                    )
                  }
                  rows={3}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </label>

              {item.image && (
                <img
                  src={item.image}
                  alt=""
                  className="h-32 w-full rounded-lg object-cover"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="mt-5 rounded-lg border px-4 py-2 text-sm font-medium"
      >
        + Add card
      </button>
    </div>
  );
}