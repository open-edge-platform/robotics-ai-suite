// SPDX-FileCopyrightText: (C) 2026 Intel Corporation
// SPDX-License-Identifier: Apache-2.0

const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");
const serveHandler = require("serve-handler");

const baseUrl = (process.env.BASE_URL || "/").replace(/\/?$/, "/");
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 3000);
const publicDir = process.env.SITE_BUILD_DIR || path.resolve(__dirname, "..", "build");

const server = http.createServer((request, response) => {
  let url;
  try {
    url = new URL(request.url, "http://localhost");
  } catch {
    response.writeHead(400).end();
    return;
  }
  if (!url.pathname.startsWith(baseUrl)) {
    response.writeHead(302, { Location: baseUrl }).end();
    return;
  }
  const relativePath = url.pathname.slice(baseUrl.length);
  if (!url.pathname.endsWith("/") && fs.existsSync(path.join(publicDir, relativePath, "index.html"))) {
    response.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end();
    return;
  }

  request.url = url.pathname.slice(baseUrl.length - 1) + url.search;
  const writeHead = response.writeHead.bind(response);
  response.writeHead = (statusCode, headers) => {
    if (baseUrl !== "/" && headers?.Location?.startsWith("/")) {
      headers.Location = `${baseUrl.slice(0, -1)}${headers.Location}`;
    }
    return writeHead(statusCode, headers);
  };
  serveHandler(request, response, {
    public: publicDir,
    cleanUrls: true,
    trailingSlash: true,
    directoryListing: false,
  }).catch((error) => {
    console.error(error);
    if (!response.headersSent) response.writeHead(500);
    response.end();
  });
}).listen(port, host, () => console.log(`Serving http://${host}:${server.address().port}${baseUrl}`));

module.exports = server;