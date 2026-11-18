const fs = require("node:fs");
const path = require("node:path");

const { buildLLMsTxt } = require("./build-llms-txt");
const { copyOverMarkdownFiles } = require("./copy-over-markdown-files");
const { getDocItemsFromSidebars } = require("./get-doc-items-from-sidebars");

/**
 * Docusaurus plugin that, after a production build, emits LLM-friendly views of
 * the docs:
 *   - `llms.txt`      — curated index (sidebar titles/descriptions + per-page links)
 *   - `llms-full.txt` — every page's markdown concatenated into one file
 *   - raw `.md` copies of each exported page, served alongside the HTML
 *
 * Options:
 *   siteDescription  — header blurb for llms.txt
 *   sidebarsConfig   — { [sidebarKey]: { title, description } }
 *   shouldExportFile — (item) => boolean; whether a page's raw markdown is exported
 */
function LLMsTxt(_context, options) {
  return {
    name: "llms-txt-plugin",

    postBuild: async ({ routes, outDir, siteConfig, siteDir }) => {
      console.log("[llms-txt] Generating llms.txt");

      const sidebars = getDocItemsFromSidebars(routes, siteConfig.baseUrl, siteDir);
      const config = {
        title: siteConfig.title,
        siteUrl: siteConfig.url,
        baseUrl: siteConfig.baseUrl,
        siteDir,
        outDir,
        ...options,
      };

      fs.writeFileSync(path.join(outDir, "llms.txt"), buildLLMsTxt(sidebars, config));
      console.log("[llms-txt] Wrote llms.txt");

      fs.writeFileSync(
        path.join(outDir, "llms-full.txt"),
        buildLLMsTxt(sidebars, config, true),
      );
      console.log("[llms-txt] Wrote llms-full.txt");

      const exportedCount = await copyOverMarkdownFiles(sidebars, config);
      console.log(`[llms-txt] Copied ${exportedCount} raw markdown files`);
    },
  };
}

module.exports = LLMsTxt;
