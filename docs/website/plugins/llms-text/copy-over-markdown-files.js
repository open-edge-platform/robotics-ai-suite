const fs = require("node:fs");
const path = require("node:path");
const { stripFrontMatter } = require("../../src/utils/markdown");
const { cleanSphinxMarkdown } = require("./sphinx-markdown");

async function copyOverMarkdownFiles(docItems, options) {
  const { siteDir, outDir, shouldExportFile } = options;
  let exportedCount = 0;

  const copyFile = async (item) => {
    if (item.file && item.webFile && shouldExportFile(item)) {
      try {
        const source = item.absolutePath || path.join(siteDir, item.file);
        if (fs.existsSync(source)) {
          const content = item.userGuideDir
            ? cleanSphinxMarkdown(source, item.userGuideDir)
            : stripFrontMatter(fs.readFileSync(source, "utf8"));
          const destination = path.join(outDir, item.webFile);
          await fs.promises.mkdir(path.dirname(destination), { recursive: true });
          fs.writeFileSync(destination, content, { encoding: "utf8" });
          exportedCount += 1;
        }
      } catch (e) {
        console.error(`[llms-txt] Error copying markdown file ${item.file}`, e);
      }
    }

    if (Array.isArray(item.items)) {
      await Promise.all(item.items.map(copyFile));
    }
  };

  await Promise.all(docItems.map(copyFile));
  return exportedCount;
}

module.exports = { copyOverMarkdownFiles };
