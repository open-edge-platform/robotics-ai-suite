const fs = require("node:fs");
const path = require("node:path");
const { normalizeUrl } = require("@docusaurus/utils");
const { ROUTE_SUBPATH } = require("../sphinx-docs");
const {
  extractDocMetadata,
  parseToctreeBlocks,
  resolveSphinxDocTarget,
} = require("./sphinx-markdown");

// Locate the content-docs version container route. Prefer the canonical
// `${baseUrl}docs` path, but fall back to any route carrying `props.version`
// so this keeps working even when a doc is slugged to `/` (which shifts paths).
function findDocsVersionRoute(routes, baseUrl) {
  const docsPlugin = routes.find(
    (route) => route.plugin && route.plugin.name === "docusaurus-plugin-content-docs",
  );
  if (!docsPlugin || !docsPlugin.routes) {
    return undefined;
  }
  const docsPath = normalizeUrl([baseUrl, "docs"]);
  return (
    docsPlugin.routes.find((route) => route.path === docsPath) ??
    docsPlugin.routes.find((route) => route.props && route.props.version)
  );
}

// Recursively collect every descendant route that maps to a source markdown file.
function collectFiles(routes, acc) {
  for (const route of routes || []) {
    if (route.metadata && route.metadata.sourceFilePath) {
      acc.push({ path: route.path, file: route.metadata.sourceFilePath });
    }
    if (route.routes) {
      collectFiles(route.routes, acc);
    }
  }
  return acc;
}

function mapPathsToSourceFilePath(container) {
  const version = container.props.version;

  const docs = version.docs;
  const idToMetadata = Object.fromEntries(
    Object.keys(docs).map((key) => {
      const doc = docs[key];
      return [
        doc.id,
        { title: doc.title, description: doc.description, sidebar: doc.sidebar },
      ];
    }),
  );

  const files = collectFiles(container.routes, []);
  // With `trailingSlash: true`, route paths end in "/" but sidebar link hrefs
  // do not, so match them slash-insensitively.
  const stripSlash = (p) => (p.length > 1 ? p.replace(/\/+$/, "") : p);
  const pathToFile = Object.fromEntries(
    files.map(({ path, file }) => [stripSlash(path), file]),
  );

  const getFilePath = (item) =>
    "href" in item && item.href ? pathToFile[stripSlash(item.href)] : undefined;
  const getMetadata = (item) =>
    "docId" in item && typeof item.docId === "string" ? idToMetadata[item.docId] : undefined;

  return { getFilePath, getMetadata };
}

function buildSphinxSidebars(siteDir, baseUrl) {
  const userGuideDir = path.resolve(siteDir, "..", "user-guide");
  const entryDoc = path.join(userGuideDir, "ai-suite-robotics.md");
  if (!fs.existsSync(entryDoc)) {
    console.warn(`[llms-txt] Sphinx entry doc not found at ${entryDoc}; skipping.`);
    return [];
  }

  const visited = new Set();

  function toDocFields(absPath, labelOverride) {
    const relFromUserGuide = path
      .relative(userGuideDir, absPath)
      .split(path.sep)
      .join("/");
    const relFromSiteDir = path
      .relative(siteDir, absPath)
      .split(path.sep)
      .join("/");
    const routePath = relFromUserGuide
      .replace(/(^|\/)index\.md$/, "$1")
      .replace(/\.md$/, "");
    const href = normalizeUrl([
      baseUrl,
      ROUTE_SUBPATH,
      routePath,
      "/",
    ]);
    const webFile = `${ROUTE_SUBPATH}/${relFromUserGuide}`;
    const metadata = extractDocMetadata(absPath, userGuideDir);
    const label = labelOverride || metadata.title || routePath;

    return {
      label,
      href,
      description: metadata.description,
      file: relFromSiteDir,
      absolutePath: absPath,
      userGuideDir,
      webFile,
      metadata: {
        title: metadata.title || label,
        description: metadata.description,
      },
    };
  }

  function buildDocNode(absPath, labelOverride) {
    if (visited.has(absPath)) {
      return [];
    }
    visited.add(absPath);

    const fields = toDocFields(absPath, labelOverride);
    const raw = fs.readFileSync(absPath, "utf8");
    const blocks = parseToctreeBlocks(raw);
    const childItems = [];

    for (const block of blocks) {
      for (const entry of block.entries) {
        const childAbs = resolveSphinxDocTarget(
          entry.target,
          path.dirname(absPath),
          userGuideDir,
        );
        if (!childAbs) continue;
        childItems.push(...buildDocNode(childAbs, entry.label));
      }
    }

    if (childItems.length > 0) {
      return [
        {
          type: "category",
          ...fields,
          items: childItems,
        },
      ];
    }

    return [
      {
        type: "link",
        ...fields,
      },
    ];
  }

  visited.add(entryDoc);
  const entryFields = toDocFields(entryDoc, "Robotics AI Suite Overview");
  const rootBlocks = parseToctreeBlocks(fs.readFileSync(entryDoc, "utf8"));

  const categories = [
    {
      type: "category",
      label: "Interactive Catalogs",
      items: [
        {
          type: "link",
          label: "AI Models",
          href: normalizeUrl([baseUrl, "models", "/"]),
          description:
            "Browse OpenVINO-optimized Physical AI, Vision AI, and Gen AI models on Hugging Face across Intel CPUs, GPUs, and NPUs.",
          metadata: {
            title: "AI Models Catalog",
            description:
              "Browse OpenVINO-optimized Physical AI, Vision AI, and Gen AI models on Hugging Face across Intel CPUs, GPUs, and NPUs.",
          },
        },
        {
          type: "link",
          label: "AI Skills",
          href: normalizeUrl([baseUrl, "skills", "/"]),
          description:
            "Search and install AI coding-agent skills for the Robotics AI Suite and Intel XPU workflows.",
          metadata: {
            title: "AI Skills Catalog",
            description:
              "Search and install AI coding-agent skills for the Robotics AI Suite and Intel XPU workflows.",
          },
        },
      ],
    },
    {
      type: "category",
      label: "Overview",
      items: [
        {
          type: "link",
          ...entryFields,
        },
      ],
    },
  ];

  for (const block of rootBlocks) {
    const sectionItems = [];
    for (const entry of block.entries) {
      const childAbs = resolveSphinxDocTarget(
        entry.target,
        path.dirname(entryDoc),
        userGuideDir,
      );
      if (!childAbs) continue;
      sectionItems.push(...buildDocNode(childAbs, entry.label));
    }
    if (sectionItems.length > 0) {
      categories.push({
        type: "category",
        label: block.caption || "Documentation",
        items: sectionItems,
      });
    }
  }

  return [
    {
      key: "docsSidebar",
      items: categories,
    },
  ];
}

function getDocItemsFromSidebars(routes, baseUrl, siteDir) {
  const container = findDocsVersionRoute(routes, baseUrl);
  if (!container) {
    if (siteDir) {
      return buildSphinxSidebars(siteDir, baseUrl);
    }
    console.warn("[llms-txt] Could not find content-docs version route; skipping.");
    return [];
  }

  const { getFilePath, getMetadata } = mapPathsToSourceFilePath(container);

  // `file` is the source path relative to siteDir; when docs live outside the
  // site dir it is prefixed with `../`. `webFile` strips that so it can be used
  // as a build-output subpath and URL (both rooted at the site/build dir).
  const toWebFile = (file) => (file ? file.replace(/^(\.\.\/)+/, "") : file);

  function parseItem(item) {
    if (item.type === "link") {
      const file = getFilePath(item);
      const metadata = getMetadata(item);
      return [
        {
          ...item,
          type: "link",
          label: item.label,
          href: item.href,
          description: item.description,
          file,
          webFile: toWebFile(file),
          metadata,
        },
      ];
    }

    if (item.type === "category") {
      const file = getFilePath(item);
      return [
        {
          type: "category",
          label: item.label,
          link: item.link,
          description: item.description,
          file,
          webFile: toWebFile(file),
          items: item.items.flatMap(parseItem),
        },
      ];
    }

    return [];
  }

  const docSidebars = container.props.version.docsSidebars;
  return Object.keys(docSidebars).map((key) => {
    const sidebar = docSidebars[key];
    const items = sidebar.flatMap((item) =>
      typeof item === "string" ? [] : parseItem(item),
    );
    return { key, items };
  });
}

module.exports = { getDocItemsFromSidebars };
