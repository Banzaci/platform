"use client";

import {
  DayPicker,
  DayPickerProps,
} from "react-day-picker";
import "react-day-picker/style.css";

import { SectionTheme } from "@/types";
import { getShadow } from "@/helpers";

type Props = DayPickerProps & {
  theme?: SectionTheme;
};

export default function ThemedDayPicker({
  theme,
  ...props
}: Props) {
  console.log(theme)
  return (
    <div
      className="border p-5"
      style={{
        backgroundColor:
          theme?.dateSelector?.backgroundColor ??
          "#ffffff",

        color:
          theme?.dateSelector?.textColor ??
          "#111111",

        borderColor:
          theme?.dateSelector?.borderColor,

        borderRadius:
          theme?.dateSelector?.borderRadius ??
          "16px",

        boxShadow: getShadow(
          theme?.dateSelector?.shadow
        ),
      }}
    >
      <DayPicker
        {...props}
        className="rdp-root"
        style={
          {
            "--rdp-accent-color":
              theme?.dateSelector?.selectedColor ??
              "#ffffff",

            "--rdp-accent-background-color":
              theme?.dateSelector?.selectedBackgroundColor ??
              "#111111",

            color:
              theme?.dateSelector?.textColor ??
              "#111111",
          } as React.CSSProperties
        }
      />
    </div>
  );
}