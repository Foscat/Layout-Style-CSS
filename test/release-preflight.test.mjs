import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
let releaseContract;
try {
  releaseContract = await import("../scripts/release-fixture-contract.mjs");
} catch {
  // RED remains an assertion failure until the companion fixture contract exists.
}

test("pins an immutable reviewed UI release fixture and writes exact checkout outputs", () => {
  assert.ok(
    releaseContract,
    "scripts/release-fixture-contract.mjs must implement the fixture contract",
  );

  const descriptor = releaseContract.readFixtureDescriptor(rootDir);
  assert.deepEqual(descriptor, {
    repository: "Foscat/ui-style-kit-css",
    revision: "72286fc27e4c3664ab05598a34c4dcf7e8267821",
  });

  const tempRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "layout-release-fixture-"),
  );
  const outputPath = path.join(tempRoot, "github-output.txt");
  try {
    releaseContract.writeGithubOutputs(descriptor, outputPath);
    assert.equal(
      fs.readFileSync(outputPath, "utf8"),
      "ui_repository=Foscat/ui-style-kit-css\nui_revision=72286fc27e4c3664ab05598a34c4dcf7e8267821\n",
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("pull requests execute read-only preflight and npm publish stays downstream", () => {
  assert.ok(
    releaseContract,
    "scripts/release-fixture-contract.mjs must implement the fixture contract",
  );

  assert.doesNotThrow(() =>
    releaseContract.validateRepositoryWorkflows(rootDir),
  );
});

test("workflow policy rejects every release or deployment mutation from pull requests", () => {
  assert.ok(
    releaseContract,
    "scripts/release-fixture-contract.mjs must implement the fixture contract",
  );

  const forbiddenMutations = [
    ["npm publish", "      - run: npm publish"],
    ["npm version", "      - run: npm version patch"],
    ["git tag", "      - run: git tag v3.0.1"],
    ["git push", "      - run: git push origin HEAD"],
    ["GitHub release", "      - uses: softprops/action-gh-release@v2"],
    ["GitHub release", "      - run: gh release create v3.0.1"],
    ["deployment", "      - uses: actions/deploy-pages@v4"],
    ["deployment", "      - run: npx wrangler deploy"],
  ];
  const safeRelease =
    "on:\n  release:\njobs:\n  publish:\n    steps:\n      - run: npm run release:preflight\n      - run: npm publish --access public --provenance --ignore-scripts\n";

  for (const [label, mutation] of forbiddenMutations) {
    assert.throws(
      () =>
        releaseContract.validateWorkflowSources([
          {
            name: "ci.yml",
            source:
              "on:\n  pull_request:\njobs:\n  verify:\n    steps:\n      - run: npm run release:preflight\n" +
              `${mutation}\n`,
          },
          { name: "npm-publish.yml", source: safeRelease },
        ]),
      new RegExp(
        `pull-request workflow ci\\.yml enables forbidden mutation: ${label}`,
      ),
    );
  }
});

test("publish workflow stages safe local checks and fixtures before one explicit lifecycle boundary", () => {
  const workflow = fs.readFileSync(
    path.join(rootDir, ".github", "workflows", "npm-publish.yml"),
    "utf8",
  );
  const manifest = JSON.parse(
    fs.readFileSync(path.join(rootDir, "package.json"), "utf8"),
  );
  const safeChecksIndex = workflow.indexOf("run: npm run check:full");
  const auditIndex = workflow.indexOf("run: npm audit --audit-level=moderate");
  const dryPackIndex = workflow.indexOf("run: npm run pack:dry-run");
  const fixtureIndex = workflow.indexOf(
    "name: Check out reviewed UI release fixture",
  );
  const companionIndex = workflow.indexOf(
    "name: Check out reviewed Interactive companion",
  );
  const preflightIndex = workflow.indexOf("run: npm run release:preflight");
  const publishIndex = workflow.indexOf(
    "run: npm publish --access public --provenance --ignore-scripts",
  );

  assert.ok(
    0 <= safeChecksIndex &&
      safeChecksIndex < auditIndex &&
      auditIndex < dryPackIndex &&
      dryPackIndex < fixtureIndex &&
      fixtureIndex < companionIndex &&
      companionIndex < preflightIndex &&
      preflightIndex < publishIndex,
    "Safe local checks, immutable fixtures, explicit preflight, and publish must retain their reviewed order.",
  );
  assert.equal(
    /^\s*run:\s+npm\s+run\s+release:verify\s*$/m.test(
      workflow.slice(0, fixtureIndex),
    ),
    false,
    "release:verify would invoke ecosystem preflight before immutable fixtures exist.",
  );
  assert.equal(manifest.scripts.prepublishOnly, "npm run release:verify");
  assertPublishIgnoreScriptsSkipsLifecycle();
});

test("publishing guide records the immutable bootstrap and merge sequence", () => {
  const guide = fs.readFileSync(
    path.join(rootDir, "docs", "wiki", "Release-And-Publishing.md"),
    "utf8",
  );

  for (const phrase of [
    "72286fc27e4c3664ab05598a34c4dcf7e8267821",
    "Push a stable UI bootstrap ref",
    "merge commits",
    "Update and verify the final UI companion pins",
    "Do not squash, rebase, or delete the only remote refs",
  ]) {
    assert.match(guide, new RegExp(phrase, "i"));
  }
});

function assertPublishIgnoreScriptsSkipsLifecycle() {
  const fixtureRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "layout-release-lifecycle-"),
  );
  const lifecycleMarker = path.join(fixtureRoot, "prepublish-only-ran");
  fs.writeFileSync(
    path.join(fixtureRoot, "package.json"),
    `${JSON.stringify(
      {
        name: "layout-release-lifecycle-contract",
        version: "1.0.0",
        private: false,
        files: ["index.css"],
        scripts: { prepublishOnly: "node lifecycle-guard.mjs" },
      },
      null,
      2,
    )}\n`,
  );
  fs.writeFileSync(
    path.join(fixtureRoot, "index.css"),
    ".layout-release-lifecycle { display: block; }\n",
  );
  fs.writeFileSync(
    path.join(fixtureRoot, "lifecycle-guard.mjs"),
    `import fs from "node:fs";\nfs.writeFileSync(${JSON.stringify(lifecycleMarker)}, "ran");\nprocess.exit(23);\n`,
  );

  try {
    const npmExecPath = process.env.npm_execpath;
    const command =
      npmExecPath && fs.existsSync(npmExecPath)
        ? process.execPath
        : process.platform === "win32"
          ? "npm.cmd"
          : "npm";
    const baseArgs =
      npmExecPath && fs.existsSync(npmExecPath) ? [npmExecPath] : [];
    const result = spawnSync(
      command,
      [
        ...baseArgs,
        "publish",
        "--dry-run",
        "--access",
        "public",
        "--ignore-scripts",
        "--loglevel",
        "error",
      ],
      {
        cwd: fixtureRoot,
        encoding: "utf8",
        shell: process.platform === "win32" && baseArgs.length === 0,
      },
    );
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(
      fs.existsSync(lifecycleMarker),
      false,
      "prepublishOnly must not run after the staged preflight.",
    );
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
}
