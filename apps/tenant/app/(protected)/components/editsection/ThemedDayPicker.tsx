"use client";

import {
  DayPicker,
  DayPickerProps,
} from "react-day-picker";
import "react-day-picker/style.css";

import { GlobalTheme } from "@/types";
import { resolveSectionTheme } from "@/libs/resolveSectionTheme";

type Props = DayPickerProps & {
  globalTheme?: GlobalTheme;
};

export default function ThemedDayPicker({
  globalTheme,
  ...props
}: Props) {
   const {
      date_selected_background,
      date_selected_color,
      date_text,
    } = resolveSectionTheme(globalTheme);

  return (
    <div
      className="border p-5"
      style={{
        // backgroundColor:
        //   theme?.dateSelector?.backgroundColor ??
        //   "#ffffff",

        // color:
        //   theme?.dateSelector?.textColor ??
        //   "#111111",

        // borderColor:
        //   theme?.dateSelector?.borderColor,

        // borderRadius:
        //   theme?.dateSelector?.borderRadius ??
        //   "16px",

        // boxShadow: getShadow(
        //   theme?.dateSelector?.shadow
        // ),
      }}
    >
      <DayPicker
        {...props}
        className="rdp-root"
        style={
          {
            "--rdp-accent-color": date_selected_color ?? "#ffffff",
            "--rdp-accent-background-color": date_selected_background ?? "#111111",
            color: date_text ?? "#111111",
          } as React.CSSProperties
        }
      />
    </div>
  );
}