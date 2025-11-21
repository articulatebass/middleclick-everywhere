const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["src/content/index.js"],
  bundle: true,
  outfile: "dist/content.js",
  sourcemap: true,
  minify: false,
  format: "esm" // support import.meta.glob()
}).catch(() => process.exit(1));
