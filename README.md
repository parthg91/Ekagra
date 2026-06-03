# Ekagra (एकाग्र)

**Achieve absolute focus. Liberate your mind with the Moksha Protocol.**

Ekagra is an advanced, high-performance Google Chrome Extension built on Manifest V3. Designed specifically for deep work, and intense focus sessions, it annihilates distractions from YouTube, empowering users to consume only what matters.

## The Core Experience

*   **The Moksha Protocol:** A radical toggle that instantly purges the YouTube homepage feed, sidebar recommendations, and the comments section, leaving only a pure, distraction-free search and watch experience.
*   **Ad Annihilation:** Relentlessly hunts down and removes sponsored content, masthead ads, and in-feed ads. Video ads are automatically and instantly skipped so your workflow is never interrupted. 
    * *Note on Initial Load:* You might notice a split-second delay before ads are purged on a fresh page load. This is a deliberate architectural decision; Ekagra waits for YouTube's Single Page Application (SPA) to fully mount the ad containers before striking. This guarantees zero false positives and prevents the underlying video player from crashing.
*   **Dynamic Keyword Filtering:** Not ready for full Moksha? Set up banned keywords. The extension scans video titles dynamically, vaporizing any content that matches your personalized blacklist, and maintain a count of them under *Distractions Filtered* section.
    * *Intentional Design (Creator Preservation):* The filter is specifically calibrated to prioritize Video Titles over Channel Names. It ensures you are blocking toxic *topics* (e.g., "drama", "gossip") without accidentally blacklisting a valuable educational creator who might just be covering that topic in a critical or nuanced way.

## The Shorts Defense System

YouTube Shorts are the ultimate enemy of the attention span. Ekagra handles them with a multi-layered defense strategy:
*   **Feed Eradication:** The Shorts shelf is completely eradicated from your Homepage and Subscribed Channels sections.
*   **The Search Honeypot:** If you actively search for a topic, YouTube's backend heavily obfuscates and forces Shorts into the search results. Ekagra intentionally leaves these as a "honeypot" trap. If your muscle memory tempts you to click on one, the **Service Worker Interceptor** catches the navigation request mid-flight and instantly redirects you to a local "Moksha Protocol" intervention page, saving your focus.
*   **Deep-Link Interception:** If you attempt to bypass the UI and directly load a `youtube.com/shorts/` URL, the Service Worker catches the request mid-flight and redirects you to a local intervention page—keeping you safe.
*   **Habit Tracking:** The "Shorts Blocked" counter in the analytics dashboard doesn't just count hidden HTML elements—it tracks your actual *attempts* to access a Short since installation. It acts as a psychological mirror, showing you exactly how many times your muscle memory tried to break your focus.

## Architecture (Manifest V3)

Ekagra is architected for speed, security, and modern extension standards:

*   **Service Worker (`background.js`):** Lightweight, event-driven background script utilizing URL interception to block Shorts at the routing level.
*   **Content Script (`content.js`):** The core logic engine. Handles DOM manipulation using highly optimized `requestAnimationFrame` batching combined with a `MutationObserver` to counter YouTube's dynamic loading without causing browser lag.
*   **Popup UI (`popup.html` / `popup.js`):** A sleek, dark-mode action popup displaying real-time analytics and controls. State changes are synchronized instantly across all open YouTube tabs using `chrome.storage.local`.

## Installation

1.  Clone this repository or download the source code.
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  Enable **"Developer mode"** in the top right corner.
4.  Click **"Load unpacked"** and select the `Ekagra` project directory.
5.  Pin the extension to your toolbar and activate the Moksha Protocol!
