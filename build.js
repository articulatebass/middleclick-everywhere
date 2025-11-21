const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["src/content/index.js"], // our content script entry
  bundle: true,
  outfile: "dist/content.js",
  sourcemap: true,
  minify: false
}).catch(() => process.exit(1));
