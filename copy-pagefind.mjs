// Cross-platform stand-in for the previous `cp -r dist/pagefind public/`
// build step: cmd.exe, the shell npm/pnpm runs scripts with on Windows,
// has no `cp`, so the full build used to fail there. Keeping the index in
// public/ lets `astro dev` and subsequent builds serve it.
import { cpSync, rmSync, statSync } from "node:fs";

if (process.argv[2] === "--clean") {
  // Astro copies the previous public index into dist before Pagefind runs.
  rmSync("dist/pagefind", { recursive: true, force: true });
} else if (process.argv[2] === undefined) {
  if (!statSync("dist/pagefind").isDirectory()) {
    throw new Error("Pagefind output must be a directory: dist/pagefind");
  }
  rmSync("public/pagefind", { recursive: true, force: true });
  cpSync("dist/pagefind", "public/pagefind", { recursive: true });
} else {
  throw new Error("Usage: node copy-pagefind.mjs [--clean]");
}
