// SPDX-FileCopyrightText: (C) 2026 Intel Corporation
// SPDX-License-Identifier: Apache-2.0

const fs = require("node:fs");
const path = require("node:path");
const { stripFrontMatter } = require("../../src/utils/markdown");

function stripFenceBlocks(content, directiveNames) {
  const lines = content.split(/\r?\n/);
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const match = /^(\s*)(:{3,}|`{3,})\{([a-zA-Z0-9_-]+)\}(?:\s+(.*))?$/.exec(
      lines[i],
    );
    if (match && directiveNames.has(match[3])) {
      const fenceChar = match[2][0];
      const fenceLen = match[2].length;
      const closeRe = new RegExp(`^\\s*\\${fenceChar}{${fenceLen},}\\s*$`);
      i += 1;
      const blockLines = [];
      while (i < lines.length && !closeRe.test(lines[i])) {
        blockLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1; // consume closing fence

      // For eval-rst, only drop metadata / orphan blocks; keep real rst content if any.
      if (match[3] === "eval-rst") {
        const body = blockLines.join("\n").trim();
        if (
          body &&
          !/^(?::orphan:|\.\.\s+meta::(?:\r?\n[ \t]+:[^\r\n]+)*)$/m.test(body)
        ) {
          out.push(lines[i - blockLines.length - 2], ...blockLines, fenceChar.repeat(fenceLen));
        }
      }
      continue;
    }
    out.push(lines[i]);
    i += 1;
  }

  return out.join("\n");
}

function expandIncludes(content, fileDir, userGuideDir, seen = new Set()) {
  const lines = content.split(/\r?\n/);
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const match = /^(\s*)(:{3,}|`{3,})\{include\}\s+([^\s]+)\s*$/.exec(lines[i]);
    if (match) {
      const fenceChar = match[2][0];
      const fenceLen = match[2].length;
      const includeTarget = match[3].trim();
      const closeRe = new RegExp(`^\\s*\\${fenceChar}{${fenceLen},}\\s*$`);
      i += 1;
      while (i < lines.length && !closeRe.test(lines[i])) {
        i += 1;
      }
      if (i < lines.length) i += 1;

      const resolved = includeTarget.startsWith("/")
        ? path.resolve(userGuideDir, includeTarget.slice(1))
        : path.resolve(fileDir, includeTarget);

      if (fs.existsSync(resolved) && !seen.has(resolved)) {
        const nextSeen = new Set(seen);
        nextSeen.add(resolved);
        const rawFragment = stripFrontMatter(fs.readFileSync(resolved, "utf8"));
        const expanded = expandIncludes(
          rawFragment,
          path.dirname(resolved),
          userGuideDir,
          nextSeen,
        );
        out.push(expanded.trim());
      }
      continue;
    }
    out.push(lines[i]);
    i += 1;
  }

  return out.join("\n");
}

function cleanSphinxMarkdown(absolutePath, userGuideDir) {
  const raw = fs.readFileSync(absolutePath, "utf8");
  let text = stripFrontMatter(raw);
  text = text
    .replace(/<!--\s{0,2}hide.{0,2}directive/g, "")
    .replace(/hide.{0,2}directive\s{0,2}-->/g, "");
  text = expandIncludes(text, path.dirname(absolutePath), userGuideDir);
  text = stripFenceBlocks(text, new Set(["toctree", "eval-rst"]));
  text = text.replace(/^\s*<link\b[^>]*>\s*$/gim, "");
  text = text.replace(/\n{3,}/g, "\n\n").trim();
  return `${text}\n`;
}

function inlineMarkdownToPlain(text) {
  return text
    .replace(/\{[a-zA-Z0-9_-]+\}`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\\(\s|$)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateDescription(text, maxLen = 180) {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:—-]+$/, "")}…`;
}

function extractDocMetadata(absolutePath, userGuideDir) {
  const raw = fs.readFileSync(absolutePath, "utf8");

  let metaDescription = "";
  const metaMatch = /\.\.\s+meta::[\s\S]*?:description:\s*([^\r\n]+)/.exec(raw);
  if (metaMatch) {
    metaDescription = metaMatch[1].trim();
  }

  const cleaned = cleanSphinxMarkdown(absolutePath, userGuideDir)
    // Remove multi-line HTML blocks like component_card_widget
    .replace(/<div\b[\s\S]*?<\/div>/gi, "");

  const lines = cleaned.split(/\r?\n/);
  let title = "";
  let headingLineIdx = -1;

  for (let i = 0; i < lines.length; i += 1) {
    const h1 = /^#\s+(.+)$/.exec(lines[i].trim());
    if (h1) {
      title = inlineMarkdownToPlain(h1[1]);
      headingLineIdx = i;
      break;
    }
  }

  let description = metaDescription;
  if (!description) {
    const paraLines = [];
    let inFence = false;
    let fenceMarker = "";

    for (let i = headingLineIdx + 1; i < lines.length; i += 1) {
      const trimmed = lines[i].trim();

      if (!inFence) {
        const fenceOpen = /^(:{3,}|`{3,})/.exec(trimmed);
        if (fenceOpen) {
          inFence = true;
          fenceMarker = fenceOpen[1];
          continue;
        }
      } else {
        const closeRe = new RegExp(
          `^\\${fenceMarker[0]}{${fenceMarker.length},}\\s*$`,
        );
        if (closeRe.test(trimmed)) {
          inFence = false;
          fenceMarker = "";
        }
        continue;
      }

      if (!trimmed) {
        if (paraLines.length > 0) break;
        continue;
      }

      if (
        trimmed.startsWith("#") ||
        trimmed.startsWith("|") ||
        trimmed.startsWith(">") ||
        trimmed.startsWith("![") ||
        trimmed.startsWith("<") ||
        trimmed.startsWith("---") ||
        /^(?:\{[a-zA-Z0-9_-]+\}`[^`]*`\s*)+$/.test(trimmed) ||
        /^[-*]\s/.test(trimmed)
      ) {
        if (paraLines.length > 0) break;
        continue;
      }

      paraLines.push(trimmed);
    }

    if (paraLines.length > 0) {
      description = truncateDescription(
        inlineMarkdownToPlain(paraLines.join(" ")),
      );
    }
  }

  return { title, description };
}

function parseToctreeBlocks(rawContent) {
  const lines = rawContent.split(/\r?\n/);
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const openMatch = /^(\s*)(:{3,}|`{3,})\{toctree\}\s*$/.exec(lines[i]);
    if (!openMatch) {
      i += 1;
      continue;
    }

    const fenceChar = openMatch[2][0];
    const fenceLen = openMatch[2].length;
    const closeRe = new RegExp(`^\\s*\\${fenceChar}{${fenceLen},}\\s*$`);
    i += 1;

    let caption = "";
    const entries = [];

    while (i < lines.length && !closeRe.test(lines[i])) {
      const trimmed = lines[i].trim();
      i += 1;
      if (!trimmed) continue;

      const optMatch = /^:([a-zA-Z0-9_-]+):\s*(.*)$/.exec(trimmed);
      if (optMatch) {
        if (optMatch[1] === "caption") {
          caption = optMatch[2].trim();
        }
        continue;
      }

      const labeledMatch = /^(.+?)\s*<([^>]+)>$/.exec(trimmed);
      if (labeledMatch) {
        entries.push({
          label: labeledMatch[1].trim(),
          target: labeledMatch[2].trim(),
        });
      } else {
        entries.push({
          label: "",
          target: trimmed,
        });
      }
    }

    if (i < lines.length) i += 1; // consume closing fence
    blocks.push({ caption, entries });
  }

  return blocks;
}

function resolveSphinxDocTarget(target, fromDir, userGuideDir) {
  if (/^https?:\/\//i.test(target) || target.startsWith("#")) {
    return null;
  }

  const cleanTarget = target.split("#")[0];
  if (!cleanTarget) return null;

  const baseCandidate = cleanTarget.startsWith("/")
    ? path.resolve(userGuideDir, cleanTarget.slice(1))
    : path.resolve(fromDir, cleanTarget);

  const candidates = [
    baseCandidate,
    `${baseCandidate}.md`,
    path.join(baseCandidate, "index.md"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

module.exports = {
  cleanSphinxMarkdown,
  extractDocMetadata,
  parseToctreeBlocks,
  resolveSphinxDocTarget,
};
