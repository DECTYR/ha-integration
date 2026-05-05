import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Copy DECTYR logo into dist: prefer integration `logo.png`, then `icon.png`; always ship SVG fallback. */
function copyDectyrBrandAssets() {
  return {
    name: "copy-dectyr-brand-assets",
    writeBundle() {
      const dist = join(__dirname, "dist");
      mkdirSync(dist, { recursive: true });
      const root = join(__dirname, "..");
      const svgSrc = join(__dirname, "branding", "dectyr-logo.svg");
      if (existsSync(svgSrc)) {
        copyFileSync(svgSrc, join(dist, "dectyr-logo.svg"));
      }
      const pngFromLogo = join(root, "logo.png");
      const pngFromIcon = join(root, "icon.png");
      if (existsSync(pngFromLogo)) {
        copyFileSync(pngFromLogo, join(dist, "dectyr-logo.png"));
      } else if (existsSync(pngFromIcon)) {
        copyFileSync(pngFromIcon, join(dist, "dectyr-logo.png"));
      }
    },
  };
}

export default {
  input: "src/dectyr-surveillance-card.ts",
  output: {
    file: "dist/dectyr-surveillance-card.js",
    format: "es",
    sourcemap: false,
  },
  plugins: [
    resolve({ browser: true }),
    commonjs(),
    typescript({ tsconfig: "./tsconfig.json" }),
    terser({
      format: { comments: false },
      compress: { drop_console: false },
    }),
    copyDectyrBrandAssets(),
  ],
};
