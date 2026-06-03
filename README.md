# Ekagra (एकाग्र)

**Achieve absolute focus. Liberate your mind with the Moksha Protocol.**

Ekagra is an advanced, high-performance Google Chrome Extension built on Manifest V3. Designed specifically for intense focus sessions, it annihilates distractions from YouTube, empowering users to consume only what matters.

## Features

*   **The Moksha Protocol:** A radical toggle that instantly purges the YouTube homepage feed, sidebar recommendations, and the comments section, leaving only a pure, distraction-free search and watch experience.
*   **Persistent Shorts Purge (Always Active):** YouTube Shorts are inherently designed to hijack your dopamine. Ekagra permanently annihilates the Shorts carousel from the DOM.
*   **Deep-Link Interception:** If you attempt to bypass the UI and directly load a `youtube.com/shorts/` URL, the Service Worker catches the request mid-flight and redirects you to a local intervention page—keeping you safe even if the Moksha Protocol is toggled off.
*   **Ad Annihilation:** Relentlessly hunts down and removes sponsored content, masthead ads, and in-feed ads. Includes an auto-clicker for skippable video ads.
*   **Dynamic Keyword Filtering:** Not ready for full Moksha? Set up banned keywords. The content script uses a persistent `MutationObserver` to scan every video card on the page dynamically, vaporizing any content that matches your personalized blacklist.
*   **Real-time Synchronization:** Built with `chrome.storage.local` and runtime messaging, ensuring UI state changes (like toggling Moksha or adding keywords) instantly reflect on active YouTube tabs without requiring a page refresh.

## Architecture (Manifest V3)

Ekagra is architected for speed, security, and modern extension standards:

*   **Service Worker (`background.js`):** Lightweight, event-driven background script utilizing `chrome.tabs.onUpdated` for instant URL interception.
*   **Content Script (`content.js`):** The core logic engine. Handles DOM manipulation using efficient selectors and a `MutationObserver` to counter YouTube's Single Page Application (SPA) dynamic loading.
*   **Popup UI (`popup.html` / `popup.js`):** A sleek, dark-mode action popup displaying real-time analytics and controls.

## Installation

1.  Clone this repository or download the source code.
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  Enable **"Developer mode"** in the top right corner.
4.  Click **"Load unpacked"** and select the `Ekagra` project directory.
5.  Pin the extension to your toolbar and activate the Moksha Protocol!

## Analytics Tracking

Ekagra tracks the exact number of Shorts you've been saved from and the total number of distraction cards filtered out by your keyword rules, gamifying your focus journey.
