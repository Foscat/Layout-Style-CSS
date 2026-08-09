import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const manifest = JSON.parse(
  await readFile(join(repositoryRoot, "package.json"), "utf8"),
);
const packageLock = JSON.parse(
  await readFile(join(repositoryRoot, "package-lock.json"), "utf8"),
);
const ecosystemManifest = JSON.parse(
  await readFile(join(repositoryRoot, "manifest.json"), "utf8"),
);
// Exact overrides keep the release audit deterministic without promoting transitive tooling to direct dependencies.
const expectedSecurityOverrides = {
  "fast-uri": "3.1.5",
  "js-yaml": "4.3.1",
  nanoid: "3.3.17",
  postcss: "8.5.23",
};
const expectedExports = {
  ".": "./dist/layout-style-css.css",
  "./min.css": "./dist/layout-style-css.min.css",
  "./core.css": "./dist/core.css",
  "./foundation.css": "./dist/foundation.css",
  "./wrappers.css": "./dist/wrappers.css",
  "./primitives.css": "./dist/primitives.css",
  "./recipes.css": "./dist/recipes.css",
  "./utilities.css": "./dist/utilities.css",
  "./personalities.css": "./dist/personalities.css",
  "./personalities/*.css": "./dist/personalities/*.css",
  "./personalities.json": "./personalities.json",
  "./manifest.json": "./manifest.json",
  "./package.json": "./package.json",
};
const requiredManifestFiles = [
  "README.md",
  "LICENSE",
  "CHANGELOG.md",
  "docs/wiki",
];
const requiredPackagedDocuments = [
  "CHANGELOG.md",
  "LICENSE",
  "README.md",
  "docs/wiki/Contributing.md",
  "docs/wiki/Demo-And-GitHub-Pages.md",
  "docs/wiki/Getting-Started.md",
  "docs/wiki/Home.md",
  "docs/wiki/Installation-And-CDN.md",
  "docs/wiki/Layout-Primitives.md",
  "docs/wiki/Layout-Recipes.md",
  "docs/wiki/Layout-Styles.md",
  "docs/wiki/Migrating-To-2.0.md",
  "docs/wiki/Migrating-To-3.0.md",
  "docs/wiki/Release-And-Publishing.md",
  "docs/wiki/Security-And-Support.md",
  "docs/wiki/UI-Style-Kit-Compatibility.md",
  "docs/wiki/_Sidebar.md",
];

function locateNpmCli() {
  const executableDirectory = dirname(process.execPath);
  const candidates = [
    process.env.npm_execpath,
    join(executableDirectory, "node_modules", "npm", "bin", "npm-cli.js"),
    resolve(
      executableDirectory,
      "..",
      "lib",
      "node_modules",
      "npm",
      "bin",
      "npm-cli.js",
    ),
  ].filter(Boolean);
  const npmCli = candidates.find((candidate) => existsSync(candidate));

  assert.ok(
    npmCli,
    `Unable to locate npm's JavaScript CLI. Checked: ${candidates.join(", ")}`,
  );
  return npmCli;
}

function runNode(args, options, label) {
  const result = spawnSync(process.execPath, args, {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    ...options,
  });

  assert.ifError(result.error);
  assert.equal(
    result.status,
    0,
    `${label} exited with ${result.status}.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  return result.stdout;
}

function runNpm(args, options, label) {
  return runNode([locateNpmCli(), ...args], options, label);
}

test("package defaults and homepage expose the intended distribution contract", () => {
  assert.equal(
    manifest.homepage,
    "https://foscat.github.io/Layout-Style-CSS/",
    "The npm homepage must open the live GitHub Pages demo",
  );
  assert.equal(manifest.main, "dist/layout-style-css.css");
  assert.equal(manifest.style, "dist/layout-style-css.css");
  assert.equal(manifest.unpkg, "dist/layout-style-css.min.css");
  assert.equal(manifest.jsdelivr, "dist/layout-style-css.min.css");
  assert.deepEqual(manifest.exports, expectedExports);

  for (const requiredFile of requiredManifestFiles) {
    assert.ok(
      manifest.files.includes(requiredFile),
      `package.json files[] must include ${requiredFile}`,
    );
  }
});

test("release metadata stays synchronized for the 3.0.1 patch", () => {
  assert.equal(manifest.version, "3.0.1");
  assert.equal(packageLock.version, "3.0.1");
  assert.equal(packageLock.packages[""].version, "3.0.1");
  assert.equal(ecosystemManifest.version, "3.0.1");
  assert.equal(Object.keys(manifest.exports).length, 13);
});

test("release security overrides resolve audited transitive tooling", () => {
  assert.deepEqual(manifest.overrides, expectedSecurityOverrides);
  assert.deepEqual(manifest.dependencies ?? {}, {});
  assert.deepEqual(packageLock.packages[""].dependencies ?? {}, {});

  for (const [packageName, expectedVersion] of Object.entries(
    expectedSecurityOverrides,
  )) {
    assert.equal(
      packageLock.packages[`node_modules/${packageName}`]?.version,
      expectedVersion,
      `Expected ${packageName}@${expectedVersion} in the release lockfile`,
    );
  }
});

test("a real packed package resolves every export and includes public documentation", async (t) => {
  const packDirectory = await mkdtemp(join(tmpdir(), "layout-style-pack-"));
  const consumerDirectory = await mkdtemp(
    join(tmpdir(), "layout-style-consumer-"),
  );
  const cacheDirectory = join(consumerDirectory, ".npm-cache");

  t.after(async () => {
    await Promise.all([
      rm(packDirectory, { force: true, recursive: true }),
      rm(consumerDirectory, { force: true, recursive: true }),
    ]);
  });

  const packOutput = runNpm(
    [
      "pack",
      "--json",
      "--ignore-scripts",
      "--pack-destination",
      packDirectory,
      "--cache",
      cacheDirectory,
    ],
    { cwd: repositoryRoot },
    "npm pack",
  );
  const [packReport] = JSON.parse(packOutput);
  assert.ok(packReport, "npm pack must report one package");

  const packedFiles = packReport.files.map(({ path }) => path.replaceAll("\\", "/"));
  for (const requiredDocument of requiredPackagedDocuments) {
    assert.ok(
      packedFiles.includes(requiredDocument),
      `Packed package must include ${requiredDocument}`,
    );
  }

  await writeFile(
    join(consumerDirectory, "package.json"),
    `${JSON.stringify({ name: "layout-style-contract-consumer", private: true, type: "module" }, null, 2)}\n`,
  );
  const tarballPath = join(packDirectory, packReport.filename);
  runNpm(
    [
      "install",
      tarballPath,
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--no-package-lock",
      "--cache",
      cacheDirectory,
    ],
    { cwd: consumerDirectory },
    "clean consumer install",
  );

  const publicSpecifiers = Object.keys(expectedExports).map((subpath) => {
    if (subpath === ".") return manifest.name;
    // Resolve one real personality through the wildcard export without weakening the exact export-map assertion above.
    return `${manifest.name}${subpath.slice(1).replace("*", "minimal-saas")}`;
  });
  const resolverPath = join(consumerDirectory, "resolve-exports.mjs");
  await writeFile(
    resolverPath,
    `import { createRequire } from "node:module";\n` +
      `const require = createRequire(import.meta.url);\n` +
      `const specifiers = ${JSON.stringify(publicSpecifiers)};\n` +
      `process.stdout.write(JSON.stringify(specifiers.map((specifier) => require.resolve(specifier))));\n`,
  );
  const resolvedExports = JSON.parse(
    runNode([resolverPath], { cwd: consumerDirectory }, "export resolver"),
  );
  assert.equal(resolvedExports.length, Object.keys(expectedExports).length);

  const installedRoot = join(consumerDirectory, "node_modules", manifest.name);
  for (const requiredDocument of requiredPackagedDocuments) {
    assert.ok(
      existsSync(join(installedRoot, requiredDocument)),
      `Installed package must include ${requiredDocument}`,
    );
  }
});
