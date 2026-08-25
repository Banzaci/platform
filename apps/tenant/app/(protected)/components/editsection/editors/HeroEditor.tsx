/* eslint-disable @typescript-eslint/no-explicit-any */
import { Field } from "../../Field";
import ImageUpload from "../../ImageUpload";
import { inputClassName } from "../ThemeEditor";

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
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Heading">
          <input
            value={content.heading?.en ?? ""}
            onChange={(e) =>
              updateLocalized("heading", e.target.value)
            }
            className={inputClassName}
          />
        </Field>

        <Field label="Button text">
          <input
            value={content.button?.label?.en ?? ""}
            onChange={(e) =>
              updateButton("label", e.target.value)
            }
            className={inputClassName}
          />
        </Field>
      </div>

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

      <Field label="Button link">
        <input
          value={content.button?.href ?? ""}
          onChange={(e) =>
            updateButton("href", e.target.value)
          }
          placeholder="/booking"
          className={inputClassName}
        />
      </Field>
    </div>
  </div>
);
}