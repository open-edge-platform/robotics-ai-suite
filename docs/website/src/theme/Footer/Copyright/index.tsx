// SPDX-FileCopyrightText: (C) 2026 Intel Corporation
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";

export default function FooterCopyright(): React.JSX.Element {
  const container = useRef<HTMLDivElement>(null);
  const includeUrl = useBaseUrl("/common-includes/footer-unified.html");

  useEffect(() => {
    const controller = new AbortController();

    async function loadFooter() {
      try {
        const response = await fetch(includeUrl, { signal: controller.signal });
        if (!response.ok) throw new Error(`Footer request failed: ${response.status}`);

        const html = new DOMParser().parseFromString(await response.text(), "text/html");
        const style = html.querySelector("style");
        const disclaimer = html.querySelector(".footer-contents");
        const header = html.querySelector("#recode50header");
        const footer = html.querySelector("#recode50footer");
        if (!style || !disclaimer || !header || !footer) {
          throw new Error("Shared footer is missing required elements");
        }

        if (controller.signal.aborted || !container.current) return;
        container.current.replaceChildren(style, disclaimer, header, footer);
        container.current.id = "footer-custom-content";
        (window as Window & { __oepIncludesLoaded?: boolean }).__oepIncludesLoaded = true;
        document.dispatchEvent(new CustomEvent("oep:includes-loaded"));
      } catch (error) {
        if (!controller.signal.aborted) console.error("Error loading shared footer:", error);
      }
    }

    void loadFooter();
    return () => controller.abort();
  }, [includeUrl]);

  return <div className="footer__copyright" ref={container} />;
}
