import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const stagedFixturePrefix = "layout-release-fixture-stage-";

export function readFixtureDescriptor(repositoryRoot) {
  const descriptor = JSON.parse(
    fs.readFileSync(
      path.join(repositoryRoot, "ecosystem-release-fixture.json"),
      "utf8",
    ),
  );
  assert.match(
    descriptor.repository,
    /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,
    "Fixture repository must be owner/name.",
  );
  assert.match(
    descriptor.revision,
    /^[0-9a-f]{40}$/,
    "Fixture revision must be an immutable 40-character commit SHA.",
  );
  return descriptor;
}

export function writeGithubOutputs(descriptor, outputPath) {
  assert.ok(
    outputPath,
    "GITHUB_OUTPUT is required for workflow source resolution.",
  );
  fs.appendFileSync(
    outputPath,
    `ui_repository=${descriptor.repository}\nui_revision=${descriptor.revision}\n`,
  );
}

export function validateWorkflowSources(workflows) {
  const mutationPatterns = [
    {
      label: "npm publish",
      pattern: /^(?!\s*(?:name:|#)).*\bnpm\s+publish\b/m,
    },
    {
      label: "npm version",
      pattern: /^(?!\s*(?:name:|#)).*\bnpm\s+version(?:\s|$)/m,
    },
    {
      label: "git tag",
      pattern: /^(?!\s*(?:name:|#)).*\bgit\s+tag(?:\s|$)/m,
    },
    {
      label: "git push",
      pattern: /^(?!\s*(?:name:|#)).*\bgit\s+push(?:\s|$)/m,
    },
    {
      label: "GitHub release",
      pattern:
        /(?:^\s*(?:-\s*)?uses:\s*(?:softprops\/action-gh-release|ncipollo\/release-action|actions\/create-release)@|^(?!\s*(?:name:|#)).*\bgh\s+release\b)/m,
    },
    {
      label: "deployment",
      pattern:
        /(?:^\s*(?:-\s*)?uses:\s*(?:actions\/(?:deploy-pages|upload-pages-artifact)|peaceiris\/actions-gh-pages|cloudflare\/wrangler-action|azure\/webapps-deploy)@|^(?!\s*(?:name:|#)).*\b(?:wrangler\s+(?:deploy|publish)|netlify\s+deploy|firebase\s+deploy|vercel(?:\s+deploy)?)\b)/m,
    },
  ];
  const pullRequestWorkflows = workflows.filter(({ source }) =>
    /^\s*pull_request\s*:/m.test(source),
  );
  assert.ok(
    pullRequestWorkflows.some(({ source }) =>
      /\bnpm\s+run\s+release:preflight\b/.test(source),
    ),
    "A pull-request workflow must execute npm run release:preflight.",
  );
  for (const workflow of pullRequestWorkflows) {
    for (const mutation of mutationPatterns) {
      if (mutation.pattern.test(workflow.source)) {
        throw new Error(
          `pull-request workflow ${workflow.name} enables forbidden mutation: ${mutation.label}`,
        );
      }
    }
  }

  const publishWorkflow = workflows.find(
    ({ name }) => name === "npm-publish.yml",
  );
  assert.ok(publishWorkflow, "npm-publish.yml must exist.");
  const preflightIndex = publishWorkflow.source.search(
    /\bnpm\s+run\s+release:preflight\b/,
  );
  const publishIndex = publishWorkflow.source.search(
    /^(?!\s*(?:name:|#)).*\bnpm\s+publish\b/m,
  );
  assert.ok(
    publishIndex >= 0,
    "npm-publish.yml must retain the package publish step.",
  );
  assert.ok(
    preflightIndex >= 0 && preflightIndex < publishIndex,
    "npm-publish.yml must run preflight before npm publish.",
  );
  assert.match(
    publishWorkflow.source,
    /^(?!\s*(?:name:|#)).*\bnpm\s+publish\b[^\r\n]*--ignore-scripts(?:\s|$)/m,
    "npm-publish.yml must suppress lifecycle re-entry after explicit preflight.",
  );
}

export function validateRepositoryWorkflows(repositoryRoot) {
  const workflowRoot = path.join(repositoryRoot, ".github", "workflows");
  const workflows = fs
    .readdirSync(workflowRoot)
    .filter((name) => /\.ya?ml$/i.test(name))
    .map((name) => ({
      name,
      source: fs.readFileSync(path.join(workflowRoot, name), "utf8"),
    }));
  validateWorkflowSources(workflows);
}

/**
 * Stages an immutable UI fixture with only the active candidate version updated.
 *
 * The reviewed UI checkout remains untouched. The copied fixture lets an
 * unpublished Layout release candidate become the documented current package for
 * the isolated ecosystem preflight run while preserving the fixture scripts and
 * installed tooling needed by that run.
 *
 * @param {string} fixtureRoot Absolute or relative UI fixture checkout path.
 * @param {object} options Candidate release information.
 * @param {string} options.candidatePackage Package name under verification.
 * @param {string} options.candidateVersion Candidate package version.
 * @returns {{ fixtureRoot: string, cleanup: () => void }} Staged fixture root and cleanup callback.
 */
export function stageFixtureForCandidate(
  fixtureRoot,
  { candidatePackage, candidateVersion },
) {
  assert.ok(candidatePackage, "Candidate package is required.");
  assert.ok(candidateVersion, "Candidate version is required.");

  const resolvedFixtureRoot = path.resolve(fixtureRoot);
  const sourceContract = JSON.parse(
    fs.readFileSync(
      path.join(resolvedFixtureRoot, "ecosystem-compatibility.json"),
      "utf8",
    ),
  );
  const currentCombinations = sourceContract.supportedCombinations?.current;
  assert.ok(
    currentCombinations &&
      Object.hasOwn(currentCombinations, candidatePackage),
    `Compatibility contract must define a current ${candidatePackage} version.`,
  );

  if (currentCombinations[candidatePackage] === candidateVersion) {
    return {
      fixtureRoot: resolvedFixtureRoot,
      cleanup() {},
    };
  }

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), stagedFixturePrefix));
  const stagedRoot = path.join(tempRoot, path.basename(resolvedFixtureRoot));
  try {
    fs.cpSync(resolvedFixtureRoot, stagedRoot, {
      recursive: true,
      filter: (source) =>
        shouldCopyFixturePath(resolvedFixtureRoot, source),
    });
    currentCombinations[candidatePackage] = candidateVersion;
    fs.writeFileSync(
      path.join(stagedRoot, "ecosystem-compatibility.json"),
      `${JSON.stringify(sourceContract, null, 2)}\n`,
    );
  } catch (error) {
    removeStagedFixtureRoot(tempRoot);
    throw error;
  }

  return {
    fixtureRoot: stagedRoot,
    cleanup() {
      removeStagedFixtureRoot(tempRoot);
    },
  };
}

/**
 * Resolves the exact published package spec documented by a fixture contract.
 *
 * @param {string} fixtureRoot Absolute or relative UI fixture root.
 * @param {string} packageName Ecosystem package name.
 * @returns {string} Exact npm package specifier, such as `ui-style-kit-css@2.4.0`.
 */
export function resolveFixturePackageSpec(fixtureRoot, packageName) {
  assert.ok(packageName, "Package name is required.");

  const contract = JSON.parse(
    fs.readFileSync(
      path.join(path.resolve(fixtureRoot), "ecosystem-compatibility.json"),
      "utf8",
    ),
  );
  const version = contract.supportedCombinations?.current?.[packageName];
  assert.ok(
    version,
    `Compatibility contract must define a current ${packageName} version.`,
  );
  return `${packageName}@${version}`;
}

/**
 * Resolves an exact package spec from the immutable compatibility contract at a
 * reviewed Git revision instead of reading potentially newer worktree content.
 *
 * @param {string} fixtureRoot UI fixture repository path.
 * @param {string} revision Reviewed 40-character commit SHA.
 * @param {string} packageName Ecosystem package name.
 * @returns {string} Exact npm package specifier recorded by the reviewed commit.
 */
export function resolveFixturePackageSpecAtRevision(
  fixtureRoot,
  revision,
  packageName,
) {
  assert.match(
    revision,
    /^[0-9a-f]{40}$/,
    "Fixture revision must be an immutable 40-character commit SHA.",
  );
  assert.ok(packageName, "Package name is required.");

  const result = spawnSync(
    "git",
    [
      "-C",
      path.resolve(fixtureRoot),
      "show",
      `${revision}:ecosystem-compatibility.json`,
    ],
    { encoding: "utf8" },
  );
  assert.equal(
    result.status,
    0,
    `Unable to read the reviewed compatibility contract at ${revision}: ${result.stderr}`,
  );

  const contract = JSON.parse(result.stdout);
  const version = contract.supportedCombinations?.current?.[packageName];
  assert.ok(
    version,
    `Reviewed compatibility contract must define a current ${packageName} version.`,
  );
  return `${packageName}@${version}`;
}

/**
 * Forces the staged UI checker and compatibility matrix to consume the same
 * published UI package for current checks.
 *
 * This avoids running the UI package's own release tests against the temporary
 * Layout candidate contract while leaving the minimum matrix under the fixture's
 * normal published-minimum package selection.
 *
 * @param {string} fixtureRoot Staged UI fixture root.
 * @param {string} uiPackageSpec Exact UI package specifier.
 * @param {Record<string, string>} [reviewedCompanionVersions] Published companion versions from the reviewed contract.
 * @returns {void}
 */
export function applyCurrentMatrixUiSpec(
  fixtureRoot,
  uiPackageSpec,
  reviewedCompanionVersions = {},
) {
  assert.match(
    uiPackageSpec,
    /^@?[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)?@[0-9A-Za-z_.-]+$/,
    "UI package spec must be an exact npm specifier.",
  );

  const versionSeparator = uiPackageSpec.lastIndexOf("@");
  const packageName = uiPackageSpec.slice(0, versionSeparator);
  const packageVersion = uiPackageSpec.slice(versionSeparator + 1);
  assert.equal(
    packageName,
    "ui-style-kit-css",
    "Current matrix override must target ui-style-kit-css.",
  );

  const preflightPath = path.join(
    path.resolve(fixtureRoot),
    "scripts",
    "release-preflight.mjs",
  );
  const source = fs.readFileSync(preflightPath, "utf8");
  const currentMatrixDeclaration =
    "const currentArgs = [checkerPath, '--matrix', 'current', `--${candidateKey}-spec`, tarball];";
  assert.ok(
    source.includes(currentMatrixDeclaration),
    "Staged UI preflight must expose the reviewed current matrix declaration.",
  );
  fs.writeFileSync(
    preflightPath,
    source.replace(
      currentMatrixDeclaration,
      `const currentArgs = [checkerPath, '--matrix', 'current', '--ui-spec', '${uiPackageSpec}', \`--\${candidateKey}-spec\`, tarball];`,
    ),
  );

  const compatibilityPath = path.join(
    path.resolve(fixtureRoot),
    "ecosystem-compatibility.json",
  );
  const compatibility = JSON.parse(
    fs.readFileSync(compatibilityPath, "utf8"),
  );
  assert.ok(
    compatibility.supportedCombinations?.current,
    "Staged compatibility contract must define a current matrix.",
  );
  compatibility.supportedCombinations.current[packageName] = packageVersion;
  for (const [companionName, companionVersion] of Object.entries(
    reviewedCompanionVersions,
  )) {
    assert.ok(
      Object.hasOwn(
        compatibility.supportedCombinations.current,
        companionName,
      ),
      `Staged compatibility contract must define ${companionName}.`,
    );
    assert.match(
      companionVersion,
      /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/,
      `${companionName} must use an exact published semantic version.`,
    );
    compatibility.supportedCombinations.current[companionName] =
      companionVersion;
  }
  fs.writeFileSync(
    compatibilityPath,
    `${JSON.stringify(compatibility, null, 2)}\n`,
  );
}

/**
 * Resolves the reviewed Interactive Surface checkout used by local ecosystem
 * verification while retaining the sibling-repository default used in CI.
 *
 * @param {string} repositoryRoot Layout Style repository root.
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} [environment] Environment values.
 * @returns {string} Absolute Interactive Surface repository path.
 */
export function resolveInteractiveRoot(
  repositoryRoot,
  environment = process.env,
) {
  return path.resolve(
    environment.CSS_ECOSYSTEM_INTERACTIVE_ROOT ??
      path.join(repositoryRoot, "..", "Interactive-Surface-CSS"),
  );
}

/**
 * Detects whether a reviewed UI preflight can register unpublished companion
 * candidates without passing an option that older immutable fixtures reject.
 *
 * @param {string} preflightSource UI release-preflight module source.
 * @returns {boolean} Whether the companion candidate option is implemented.
 */
export function supportsCompanionCandidateRoot(preflightSource) {
  return /arg\s*===\s*['"]--companion-candidate-root['"]/.test(
    preflightSource,
  );
}

async function runCli(args) {
  const descriptor = readFixtureDescriptor(rootDir);
  if (args.includes("--write-github-outputs")) {
    writeGithubOutputs(descriptor, process.env.GITHUB_OUTPUT);
    return;
  }

  const { fixtureRoot, forwardedArgs } = parseFixtureRoot(args);
  const resolvedFixtureRoot = path.resolve(
    fixtureRoot ??
      process.env.CSS_ECOSYSTEM_FIXTURE_ROOT ??
      path.join(rootDir, "..", "ui-style-kit-css"),
  );
  const preflightModule = path.join(
    resolvedFixtureRoot,
    "scripts",
    "release-preflight.mjs",
  );
  assert.ok(
    fs.existsSync(preflightModule),
    `Reviewed UI release fixture is missing ${preflightModule}.`,
  );
  assertReviewedRevision(resolvedFixtureRoot, descriptor.revision);

  const packageManifest = JSON.parse(
    fs.readFileSync(path.join(rootDir, "package.json"), "utf8"),
  );
  const packageName = packageManifest.name;
  const stagedFixture = stageFixtureForCandidate(resolvedFixtureRoot, {
    candidatePackage: packageName,
    candidateVersion: packageManifest.version,
  });
  const siblingInteractive = resolveInteractiveRoot(rootDir);
  const stagedPreflightModule = path.join(
    stagedFixture.fixtureRoot,
    "scripts",
    "release-preflight.mjs",
  );
  assert.ok(
    fs.existsSync(stagedPreflightModule),
    `Staged UI release fixture is missing ${stagedPreflightModule}.`,
  );
  const hasExplicitInteractiveRepo = forwardedArgs.includes(
    "--interactive-repo",
  );
  const useLocalInteractiveCandidate =
    !hasExplicitInteractiveRepo &&
    supportsCompanionCandidateRoot(
      fs.readFileSync(stagedPreflightModule, "utf8"),
    );
  if (stagedFixture.fixtureRoot !== resolvedFixtureRoot) {
    const reviewedInteractiveSpec = resolveFixturePackageSpecAtRevision(
      resolvedFixtureRoot,
      descriptor.revision,
      "interactive-surface-css",
    );
    const interactiveVersion = useLocalInteractiveCandidate
      ? JSON.parse(
          fs.readFileSync(
            path.join(siblingInteractive, "package.json"),
            "utf8",
          ),
        ).version
      : reviewedInteractiveSpec.slice(
          reviewedInteractiveSpec.lastIndexOf("@") + 1,
        );
    applyCurrentMatrixUiSpec(
      stagedFixture.fixtureRoot,
      resolveFixturePackageSpecAtRevision(
        resolvedFixtureRoot,
        descriptor.revision,
        "ui-style-kit-css",
      ),
      {
        "interactive-surface-css": interactiveVersion,
      },
    );
  }
  try {
    const commandArgs = [
      stagedPreflightModule,
      "--fixture-root",
      stagedFixture.fixtureRoot,
      "--candidate-root",
      rootDir,
      "--candidate-package",
      packageName,
      ...(useLocalInteractiveCandidate
        ? [
            "--companion-candidate-root",
            siblingInteractive,
            "--interactive-repo",
            siblingInteractive,
          ]
        : []),
      "--interactive-docs-repo",
      siblingInteractive,
      "--layout-docs-repo",
      rootDir,
      ...forwardedArgs,
    ];
    run(process.execPath, commandArgs, { cwd: rootDir });
  } finally {
    stagedFixture.cleanup();
  }
}

function parseFixtureRoot(args) {
  const forwardedArgs = [];
  let fixtureRoot;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--fixture-root") {
      fixtureRoot = args[(index += 1)];
      assert.ok(fixtureRoot, "--fixture-root requires a value.");
    } else {
      forwardedArgs.push(args[index]);
    }
  }
  return { fixtureRoot, forwardedArgs };
}

function assertReviewedRevision(fixtureRoot, revision) {
  const result = spawnSync(
    "git",
    ["-C", fixtureRoot, "merge-base", "--is-ancestor", revision, "HEAD"],
    {
      encoding: "utf8",
    },
  );
  assert.equal(
    result.status,
    0,
    `UI fixture checkout must contain reviewed revision ${revision}; got ${result.stderr || result.stdout || "unknown git error"}.`,
  );
}

function shouldCopyFixturePath(fixtureRoot, source) {
  const relativePath = path.relative(fixtureRoot, source);
  if (!relativePath) return true;

  const firstSegment = relativePath.split(path.sep)[0];
  if (
    new Set([".git", ".tmp", "output", "test-results"]).has(firstSegment) ||
    path.basename(source).toLowerCase() === "desktop.ini" ||
    path.extname(source).toLowerCase() === ".tgz"
  ) {
    return false;
  }

  return true;
}

function removeStagedFixtureRoot(tempRoot) {
  if (!fs.existsSync(tempRoot)) return;

  const tempDirectory = fs.realpathSync(os.tmpdir());
  const target = fs.realpathSync(tempRoot);
  assert.ok(
    target.startsWith(`${tempDirectory}${path.sep}`) &&
      path.basename(target).startsWith(stagedFixturePrefix),
    `Refusing to remove unexpected staged fixture directory: ${target}`,
  );
  fs.rmSync(target, { recursive: true, force: true });
}

function run(command, args, { cwd }) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(
      `Command failed (${result.status}): ${command} ${args.join(" ")}`,
    );
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await runCli(process.argv.slice(2));
}
