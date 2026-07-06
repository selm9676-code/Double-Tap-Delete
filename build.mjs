import esbuild from "esbuild";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

// This is the folder name that ends up in your plugin URL:
// https://<user>.github.io/<repo>/doubletap-edit-delete
const PLUGIN_ID = "doubletap-edit-delete";
const outdir = `dist/${PLUGIN_ID}`;

mkdirSync(outdir, { recursive: true });

await esbuild.build({
  entryPoints: ["index.tsx"],
  bundle: true,
  outfile: `${outdir}/index.js`,
  format: "cjs",
  platform: "node",
  target: "esnext",
  minify: true,
  // These are provided at runtime by the ShiggyCord/Bunny/Kettu loader —
  // do NOT bundle them, or the plugin will crash on load.
  external: ["@vendetta", "@vendetta/*", "react", "react-native"],
});

const built = readFileSync(`${outdir}/index.js`);
const hash = createHash("sha256").update(built).digest("hex").slice(0, 8);

const manifest = {
  name: "Double Tap Edit/Delete",
  description:
    "Double tap your own message to instantly edit or delete it. Works in DMs, group chats, and servers.",
  authors: [{ name: "Evader", id: "0" }],
  main: "index.js",
  hash,
};

writeFileSync(`${outdir}/manifest.json`, JSON.stringify(manifest, null, 2));

console.log(`Built ${PLUGIN_ID} -> ${outdir} (hash ${hash})`);
