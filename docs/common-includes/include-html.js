// SPDX-FileCopyrightText: (C) 2025 Intel Corporation
// SPDX-License-Identifier: Apache-2.0

// this script loads the common footer file into the page
const includeBaseUrl = new URL('.', document.currentScript.src);

async function loadInclude(inc_container, inc_section_name) {

    try {
        const response = await fetch(
            new URL(`${encodeURIComponent(inc_section_name)}.html`, includeBaseUrl)
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.text();
        inc_container.innerHTML = data;
    } catch (error) {
        console.error(`Error loading ${inc_section_name}:`, error);
        inc_container.innerHTML = `<p>Error loading content.</p>`;
    }
}

// wait for all includes to finish
async function loadAllIncludes() {
    const containers = document.querySelectorAll(`[data-include]`);
    const promises = Array.from(containers).map(inc_container => {
        const inc_section_name = inc_container.getAttribute(`data-include`);
        return inc_section_name ? loadInclude(inc_container, inc_section_name) : Promise.resolve();
    });

    // wait for includes to finish, then notify any listeners.
    await Promise.all(promises);
    window.__oepIncludesLoaded = true;
    document.dispatchEvent(new CustomEvent('oep:includes-loaded'));
}

document.addEventListener('DOMContentLoaded', function () {
    loadAllIncludes();
});
