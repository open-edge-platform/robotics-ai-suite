These files are copied into the website build at `/common-includes/` and hosted
at the root of the server. They are shared by different versions of the docs,
so updating them affects already-published pages. For example:

https://developer.robotics.intel.com/common-includes/kapa-consent-fallback.v1.js

## Analytics and consent

Both Sphinx and Docusaurus pages load `head-bootstrap.v1.js`. It sets the Intel
WAP microsite profile, `us-en` locale, `dev-robotics-intel` section, and production
environment before loading the WAP consent/tag manager. Docusaurus sets
`wapSinglePage` because its client-side navigation is a single-page application;
Sphinx pages do not. Intel's generated footer provides the Cookies and Privacy
links. The optional WAP performance configuration is queued for analytics consent
on both sites.

Site-owned storage and consent categories:

| Storage or integration | Category | When disabled |
| --- | --- | --- |
| WAP/OneTrust consent cookies (`OptanonConsent`, `OptanonAlertBoxClosed`) and local storage (`_wap_user_consent`, `_wap_user_consent_str`, `_wap_user_consent_data`) | Strictly necessary for recording and honoring consent | Without these, preferences may not persist and visitors may be prompted again. The bootstrap only copies existing consent values into the location-specific consent bucket. |
| `oepReloadAfterFunctionalConsent` session storage | Strictly necessary for completing a user-requested chat consent flow | Chat may require a manual refresh after granting consent if session storage is unavailable. |
| `oepConsentDebug` and `oepChatDebug` local storage (read only; set manually for diagnostics) | Functional, optional | No visitor-facing functionality is affected. |
| Google Analytics (`gtag.js`, `G-0TZHPQ70GD`) | Analytics | No Google Analytics tracking; documentation and catalog remain available. Loaded only through the WAP `analytics` category queue. |
| Kapa AI chat widget | Functional | Chat is unavailable; the consent fallback offers access to cookie preferences only when OneTrust's preferences dialog can be opened. If OneTrust is not configured or fails to load, the fallback stays hidden. The widget loads only through the WAP `functional` category queue. |
| Intel WAP/Adobe Tags and performance configuration | Managed by Intel WAP; any analytics or ad targeting storage must follow the corresponding WAP consent category | Analytics/ad targeting measurement is unavailable without consent; core documentation remains available. |

No site-owned ad targeting storage or other session storage writers were found in
the documentation sources. WAP, OneTrust, Docusaurus, and embedded third-party
assets can create their own cookies or storage; verify their live inventory and
category mapping with the WAP team before release. In particular, confirm that
the performance configuration does not write optional storage before consent.
Tell business stakeholders that declining Functional consent disables AI chat,
and declining Analytics consent removes GA and Adobe measurement; the guides and
catalog do not depend on either category.