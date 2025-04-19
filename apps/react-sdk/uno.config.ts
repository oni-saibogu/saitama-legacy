import { defineConfig, presetWebFonts } from "unocss";
import { presetWind3 } from "@unocss/preset-wind3";

export default defineConfig({
  presets: [
    presetWind3({ dark: "class" }),
    presetWebFonts({
      provider: "google",
      fonts: {
        sans: ["Open Sans"],
      },
    }),
  ],
});
