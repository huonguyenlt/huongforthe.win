import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const script = fileURLToPath(new URL("../copy-pagefind.mjs", import.meta.url));

test("rebuilds the search files without retaining deleted content", t => {
  const root = mkdtempSync(join(tmpdir(), "huong-blog-pagefind-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const dist = join(root, "dist/pagefind");
  const publicIndex = join(root, "public/pagefind");
  mkdirSync(dist, { recursive: true });
  mkdirSync(publicIndex, { recursive: true });
  writeFileSync(join(dist, "old-post"), "old post");
  writeFileSync(join(publicIndex, "old-post"), "old post");
  writeFileSync(join(root, "public/keep.txt"), "keep");

  const clean = spawnSync(process.execPath, [script, "--clean"], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(clean.status, 0, clean.stderr);
  assert.equal(existsSync(dist), false);
  assert.equal(existsSync(join(publicIndex, "old-post")), true);

  mkdirSync(dist);
  writeFileSync(join(dist, "new-post"), "new post");
  const copy = spawnSync(process.execPath, [script], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(copy.status, 0, copy.stderr);
  assert.equal(existsSync(join(publicIndex, "old-post")), false);
  assert.equal(readFileSync(join(publicIndex, "new-post"), "utf8"), "new post");
  assert.equal(readFileSync(join(root, "public/keep.txt"), "utf8"), "keep");
});

test("rejects unrecognized modes", () => {
  const result = spawnSync(process.execPath, [script, "--unknown"], {
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Usage: node copy-pagefind\.mjs/);
});

test("preserves the previous public index if the new output is missing", t => {
  const root = mkdtempSync(join(tmpdir(), "huong-blog-pagefind-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const publicIndex = join(root, "public/pagefind");
  mkdirSync(publicIndex, { recursive: true });
  writeFileSync(join(publicIndex, "old-post"), "old post");

  const result = spawnSync(process.execPath, [script], {
    cwd: root,
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.equal(readFileSync(join(publicIndex, "old-post"), "utf8"), "old post");
});
