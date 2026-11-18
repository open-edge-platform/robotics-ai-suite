const fs = require("node:fs");
const path = require("node:path");
const { normalizeUrl } = require("@docusaurus/utils");
const { stripFrontMatter } = require("../../src/utils/markdown");
const { cleanSphinxMarkdown } = require("./sphinx-markdown");

function formatDocEntry(item, options, full = false) {
  const { siteDir, siteUrl, baseUrl, shouldExportFile } = options;

  if (item.file && item.file.endsWith("redirect.md")) {
    item.file = undefined;
    item.webFile = undefined;
  }

  if (full) {
    if (!item.file) return [];
    const absolute = item.absolutePath || path.join(siteDir, item.file);
    if (!fs.existsSync(absolute)) return [];
    if (item.userGuideDir) {
      return [cleanSphinxMarkdown(absolute, item.userGuideDir)];
    }
    return [stripFrontMatter(fs.readFileSync(absolute, "utf8"))];
  }

  if (!item.href) return [];
  const pageUrl = normalizeUrl([siteUrl, item.href]);
  const fileUrl = item.webFile
    ? normalizeUrl([siteUrl, baseUrl, item.webFile])
    : undefined;

  const title = item.metadata ? item.metadata.title : item.label;
  const description = item.metadata?.description ?? item.description ?? "";
  const targetUrl = shouldExportFile(item) && fileUrl ? fileUrl : pageUrl;

  return [
    description ? `- [${title}](${targetUrl}): ${description}` : `- [${title}](${targetUrl})`,
  ];
}

function formatItem(item, depth, options, full = false) {
  if (item.type === "category") {
    const selfLines = item.href ? formatDocEntry(item, options, full) : [];
    const childLines = item.items.flatMap((child) =>
      formatItem(child, depth + 1, options, full),
    );

    if (full) {
      return [...selfLines, ...childLines];
    }

    const headingHashes = "#".repeat(Math.min(depth, 6));
    return [
      ``,
      `${headingHashes} ${item.label}`,
      ...(item.description && !item.href ? ["", item.description] : []),
      ``,
      ...selfLines,
      ...childLines,
    ];
  }

  if (item.type === "link") {
    return formatDocEntry(item, options, full);
  }

  return [];
}

function buildLLMsTxt(sidebars, options, full = false) {
  const docsRecords = sidebars
    .flatMap((sidebar) => {
      const details = options.sidebarsConfig?.[sidebar.key];
      const startDepth = details === undefined ? 2 : 3;
      const content = sidebar.items.flatMap((item) =>
        formatItem(item, startDepth, options, full),
      );

      if (details === undefined || full) {
        return content;
      }

      return [`## ${details.title}`, ``, details.description, ``, ...content, ``];
    })
    .join(full ? "\n\n---\n\n" : "\n");

  return `# ${options.title}

${options.siteDescription}

${docsRecords.trim()}
`;
}

module.exports = { buildLLMsTxt };
