import { TextField } from "../../TextField";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Props = {
  content: {
    heading?: {
      en?: string;
    };
    text?: {
      en?: string;
    };
    [key: string]: any;
  };
  onChange: (content: any) => void;
};

export default function PropertyGridEditor({
  content,
  onChange,
}: Props) {
  function updateLocalized(key: "heading" | "text", value: string ) {
    onChange({
      ...content,
      [key]: {
        ...content[key],
        en: value,
      },
    });
  }

  return (
    <div className="space-y-5 text-black">
      <TextField
        label="Heading"
        value={content.heading?.en}
        onChange={(value) =>
          updateLocalized("heading", value)
        }
      />
      <TextField
        label="Text"
        value={content.text?.en}
        multiline
        onChange={(value) =>
          updateLocalized("text", value)
        }
      />
    </div>
  );
}