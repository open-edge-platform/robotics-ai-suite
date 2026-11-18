const fs = require("node:fs");
const path = require("node:path");

const sphinxDocs = require("../sphinx-docs");

// Site-wide search index generator.
//
// The site is a hybrid: Docusaurus renders `/` and `/models/`, while the bulk
// of the content is pre-built Sphinx HTML staged under `.sphinx-static/
// development-stack/` (see plugins/sphinx-docs.js). No off-the-shelf Docusaurus
// search plugin can index the external Sphinx HTML, so this plugin crawls the
// staged HTML at build/dev time, extracts title + text per page, and writes a
// flat JSON index. The index is written INTO the staged static dir so it is
// served at `${baseUrl}search-index.json` in both `docusaurus start` and
// `docusaurus build` (staticDirectories are copied verbatim to the build).
// The navbar SearchBar (src/theme/SearchBar) fetches and queries it client-side.

const STAGING_DIR = sphinxDocs.STAGING_DIR;
const ROUTE_SUBPATH = sphinxDocs.ROUTE_SUBPATH; // "development-stack"
const INDEX_FILE = path.join(STAGING_DIR, "search-index.json");

// Directories inside the staged Sphinx tree that hold assets or generated
// helper pages rather than real documentation content.
const SKIP_DIRS = new Set([
  "_static",
  "_images",
  "_sources",
  "_downloads",
  "search",
  "genindex",
]);

const ENTITY_MAP = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&nbsp;": " ",
  "&mdash;": "\u2014",
  "&ndash;": "\u2013",
  "&copy;": "\u00a9",
  "&reg;": "\u00ae",
  "&trade;": "\u2122",
};

function decodeEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
      String.fromCharCode(parseInt(code, 16)),
    )
    .replace(
      /&amp;|&lt;|&gt;|&quot;|&nbsp;|&mdash;|&ndash;|&copy;|&reg;|&trade;/g,
      (m) => ENTITY_MAP[m] || m,
    );
}

// Strip a fragment of Sphinx HTML down to plain, whitespace-collapsed text.
function htmlToText(html) {
  return decodeEntities(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      // Drop the "¶"/"#" permalink anchors Sphinx appends to headings.
      .replace(/<a[^>]*class="headerlink"[\s\S]*?<\/a>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html) {
  const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
  if (h1) {
    const text = htmlToText(h1[1]);
    if (text) return text;
  }
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  if (title) {
    // Sphinx titles look like "Page Name — Robotics AI Suite Documentation".
    return decodeEntities(title[1]).split("\u2014")[0].trim();
  }
  return "";
}

function extractContent(html) {
  const article = /<article\b[^>]*>([\s\S]*?)<\/article>/i.exec(html);
  const region = article
    ? article[1]
    : (/<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html) || [null, html])[1];
  return htmlToText(region);
}

function sectionForRelPath(relPath) {
  if (relPath.includes("/hardware_blueprints/")) return "Blueprints";
  if (relPath.includes("/software_references/")) return "Reference Workflows";
  if (relPath.includes("/platform_foundation/")) return "Getting Started";
  if (relPath.includes("/components/")) return "Components";
  if (relPath.includes("/ai_resources/")) return "AI Toolkits";
  if (relPath.includes("/resources/")) return "Resources";
  return "Robotics AI Suite";
}

function walkHtml(dir, onFile) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walkHtml(path.join(dir, entry.name), onFile);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      onFile(path.join(dir, entry.name));
    }
  }
}

// Docusaurus-rendered pages are not on disk when this runs, so index them from
// static metadata. Keep the copy keyword-rich so the pages are findable.
function docusaurusEntries(baseUrl) {
  return [
    {
      id: "page-home",
      title: "Robotics AI Suite",
      section: "Home",
      url: baseUrl,
      content:
        "Home. Intel Robotics AI Suite. One x86 box that senses, thinks, " +
        "and moves in real time. Robotics ecosystem, hardware blueprints, " +
        "featured AI models, robot perception, real-time control, edge AI " +
        "systems, OpenVINO, physical AI at the edge.",
    },
    {
      id: "page-models",
      title: "AI Models",
      section: "AI Models",
      url: `${baseUrl}models/`,
      content:
        "AI Models catalog. Build with PyTorch, Physical AI Studio, or your " +
        "tooling of choice, then deploy with OpenVINO across Intel CPUs, " +
        "GPUs, and NPUs. Browse models available on Hugging Face, " +
        "pre-optimized and ready for fine-tuning or edge deployment. " +
        "Vision AI, Gen AI, Physical AI.",
    },
    {
      id: "page-skills",
      title: "AI Skills",
      section: "AI Skills",
      url: `${baseUrl}skills/`,
      content:
        "AI Skills catalog for coding agents and workflows. Robotics AI Suite " +
        "toolkit skills and Intel AI skills for ROS 2, Nav2, wandering, " +
        "Intel Arc XPU, PyTorch, OpenVINO, oneAPI, and performance tuning.",
    },
  ];
}

function buildIndex(baseUrl) {
  const normBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const entries = docusaurusEntries(normBase);
  const stagedDocs = path.join(STAGING_DIR, ROUTE_SUBPATH);

  if (fs.existsSync(stagedDocs)) {
    walkHtml(stagedDocs, (filePath) => {
      const html = fs.readFileSync(filePath, "utf8");
      // Redirect stubs (root index + legacy .html fallbacks) carry a meta
      // refresh; skip them so only real content pages are indexed.
      if (/http-equiv=["']refresh["']/i.test(html)) return;

      const relFromStaging = path
        .relative(STAGING_DIR, filePath)
        .split(path.sep)
        .join("/");
      // Map "development-stack/foo/bar/index.html" -> "/development-stack/foo/bar/".
      let urlPath = relFromStaging.replace(/(^|\/)index\.html$/, "$1");
      if (!urlPath.endsWith("/")) urlPath += "/";
      const url = `${normBase}${urlPath}`;

      const title = extractTitle(html);
      const content = extractContent(html).slice(0, 4000);
      if (!title && !content) return;

      entries.push({
        id: relFromStaging,
        title: title || url,
        section: sectionForRelPath(relFromStaging),
        url,
        content,
      });
    });
  }

  return entries;
}

function generate(baseUrl) {
  try {
    const entries = buildIndex(baseUrl);
    const json = JSON.stringify(entries);
    // The index lives inside the staged static dir, which the dev server
    // watches. Only write when the content actually changes, otherwise each
    // write would retrigger a reload -> loadContent -> write loop.
    let existing = null;
    try {
      existing = fs.readFileSync(INDEX_FILE, "utf8");
    } catch {
      existing = null;
    }
    if (existing === json) return;
    fs.mkdirSync(STAGING_DIR, { recursive: true });
    fs.writeFileSync(INDEX_FILE, json, "utf8");
    console.log(`[site-search] Wrote ${entries.length} entries to search-index.json`);
  } catch (err) {
    console.warn(`[site-search] Failed to build search index: ${err.message}`);
  }
}

function currentBaseUrl() {
  const raw = process.env.BASE_URL || "/";
  return raw.endsWith("/") ? raw : `${raw}/`;
}

// Generate once at load so the index exists for the first request; the sphinx
// HTML is already staged by plugins/sphinx-docs.js at config-eval time.
generate(currentBaseUrl());

module.exports = function siteSearchPlugin(context) {
  const baseUrl = (context && context.baseUrl) || currentBaseUrl();
  return {
    name: "site-search",
    // Re-generate after sphinx-docs re-stages on each (re)load so dev-server
    // edits and fresh doc builds are reflected without a full restart.
    loadContent() {
      generate(baseUrl);
    },
  };
};
