const fs = require("node:fs");
const path = require("node:path");

// The "Development Stack" docs are authored in Sphinx (docs/user-guide) and
// built to docs/out/html by `make build`. Docusaurus doesn't render Sphinx, so
// we stage that pre-built HTML under a subfolder and expose it as a static
// directory. Docusaurus then serves it verbatim at /development-stack/ in both
// `docusaurus start` (dev) and `docusaurus build` (prod).
const SPHINX_DIRHTML_DIR = path.resolve(__dirname, "..", "..", "out", "dirhtml");
const SPHINX_HTML_DIR = path.resolve(__dirname, "..", "..", "out", "html");
const STAGING_DIR = path.resolve(__dirname, "..", ".sphinx-static");
const ROUTE_SUBPATH = "development-stack";

function stageSphinxHtml() {
  const dest = path.join(STAGING_DIR, ROUTE_SUBPATH);
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(
    path.resolve(__dirname, "..", "..", "common-includes"),
    path.join(STAGING_DIR, "common-includes"),
    { recursive: true },
  );

  const sphinxOutDir = fs.existsSync(SPHINX_DIRHTML_DIR)
    ? SPHINX_DIRHTML_DIR
    : SPHINX_HTML_DIR;

  if (!fs.existsSync(sphinxOutDir)) {
    console.warn(
      `[sphinx-docs] Neither ${SPHINX_DIRHTML_DIR} nor ${SPHINX_HTML_DIR} found. ` +
        `Run \`make build\` in docs/ to generate the Sphinx documentation. ` +
        `Serving an empty /${ROUTE_SUBPATH}/ for now.`,
    );
    return;
  }

  fs.cpSync(sphinxOutDir, dest, { recursive: true });

  const rawBase = process.env.BASE_URL || "/";
  const baseUrl = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;
  const canonicalHomeUrl = `${baseUrl}development-stack/ai-suite-robotics/`;

  const makeRedirectHtml = (target) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=${target}">
    <script src="${baseUrl}common-includes/head-bootstrap.v1.js"></script>
    <script>window.location.replace('${target}');</script>
  </head>
  <body>
    <p>Redirecting to <a href="${target}">Development Stack</a>...</p>
    <p><a href="https://www.intel.com/content/www/us/en/privacy/intel-cookie-notice.html">Cookies</a> | <a href="https://www.intel.com/content/www/us/en/privacy/intel-privacy-notice.html">Privacy</a></p>
  </body>
</html>`;

  // Root /development-stack/ redirects to the documentation entry point /development-stack/ai-suite-robotics/
  fs.writeFileSync(path.join(dest, "index.html"), makeRedirectHtml(canonicalHomeUrl));

  // Legacy ai-suite-robotics.html redirects to canonical /development-stack/ai-suite-robotics/
  fs.writeFileSync(path.join(dest, "ai-suite-robotics.html"), makeRedirectHtml(canonicalHomeUrl));

  // Create backwards-compatible .html redirects for any subdirectory containing index.html
  function createHtmlRedirects(dir, relPath = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === "_static" || entry.name === "_images" || entry.name === "_sources") {
        continue;
      }
      const fullPath = path.join(dir, entry.name);
      const subRel = relPath ? `${relPath}/${entry.name}` : entry.name;
      const indexPath = path.join(fullPath, "index.html");
      const htmlFallbackPath = path.join(dir, `${entry.name}.html`);
      if (fs.existsSync(indexPath) && !fs.existsSync(htmlFallbackPath)) {
        const target = `${baseUrl}${ROUTE_SUBPATH}/${subRel}/`;
        fs.writeFileSync(htmlFallbackPath, makeRedirectHtml(target));
      }
      createHtmlRedirects(fullPath, subRel);
    }
  }

  createHtmlRedirects(dest);

  console.log(`[sphinx-docs] Staged Sphinx HTML from ${sphinxOutDir} for /${ROUTE_SUBPATH}/`);
}

// Stage at module load so the static directory exists before Docusaurus
// validates `staticDirectories`.
stageSphinxHtml();

module.exports = function sphinxDocsPlugin() {
  return {
    name: "sphinx-docs",
    // Re-stage on each (re)load so a fresh `make build` is picked up by the dev
    // server without restarting Docusaurus.
    loadContent() {
      stageSphinxHtml();
    },
  };
};

module.exports.STAGING_DIR = STAGING_DIR;
module.exports.ROUTE_SUBPATH = ROUTE_SUBPATH;
