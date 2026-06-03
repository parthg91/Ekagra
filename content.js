let isMokshaActive = false;
let bannedKeywords = [];

// Initialize state
function initState() {
  chrome.storage.local.get({ isMokshaActive: false, bannedKeywords: [] }, (data) => {
    isMokshaActive = data.isMokshaActive;
    bannedKeywords = data.bannedKeywords;
    cleanYouTube();
  });
}

initState();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'UPDATE_STATE') {
    isMokshaActive = request.isMokshaActive;
    bannedKeywords = request.bannedKeywords;
    cleanYouTube();
  }
});

function cleanYouTube() {
  // Rule A: Ad Annihilation & Shorts UI (Always Active)
  const adSelectors = [
    'ytd-ad-slot-renderer',
    'ytd-promoted-sparkles-web-renderer',
    'ytd-in-feed-ad-layout-renderer',
    'ytd-banner-promo-renderer',
    '.ytd-video-masthead-ad-v3-renderer',
    'ytd-rich-shelf-renderer[is-shorts]'
  ];

  adSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
  });

  // Hide guide entry for shorts
  document.querySelectorAll('ytd-guide-entry-renderer').forEach(el => {
    const text = el.textContent.toLowerCase();
    const href = el.querySelector('a') ? el.querySelector('a').href.toLowerCase() : '';
    if (text.includes('shorts') || href.includes('shorts')) {
      el.style.setProperty('display', 'none', 'important');
    }
  });

  // Auto-Clicker
  const skipButtons = document.querySelectorAll('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-ad-skip-button-container');
  skipButtons.forEach(btn => {
    if (btn && typeof btn.click === 'function') {
      btn.click();
    }
  });

  // Rule B: Moksha Protocol
  const feed = document.querySelector('#page-manager ytd-browse');
  const sidebar = document.querySelector('#related');
  const comments = document.querySelector('ytd-comments, #comments');

  if (isMokshaActive) {
    if (feed) feed.style.setProperty('display', 'none', 'important');
    if (sidebar) sidebar.style.setProperty('display', 'none', 'important');
    if (comments) comments.style.setProperty('display', 'none', 'important');
  } else {
    // Restore if Moksha is disabled
    if (feed) feed.style.removeProperty('display');
    if (sidebar) sidebar.style.removeProperty('display');
    if (comments) comments.style.removeProperty('display');

    // Rule C: Keyword Filter (only applies if Moksha is false, as feed/sidebar are visible)
    if (bannedKeywords && bannedKeywords.length > 0) {
      let filteredCount = 0;
      const cards = document.querySelectorAll('ytd-rich-item-renderer, ytd-compact-video-renderer');
      cards.forEach(card => {
        const titleEl = card.querySelector('#video-title');
        if (titleEl) {
          const title = titleEl.textContent.toLowerCase();
          const shouldHide = bannedKeywords.some(kw => title.includes(kw.toLowerCase()));
          if (shouldHide) {
            if (card.style.display !== 'none') {
              card.style.setProperty('display', 'none', 'important');
              filteredCount++;
            }
          } else {
             // Reset if keyword was removed
             card.style.removeProperty('display');
          }
        }
      });
      
      if (filteredCount > 0) {
        chrome.storage.local.get({ itemsFiltered: 0 }, (data) => {
          chrome.storage.local.set({ itemsFiltered: data.itemsFiltered + filteredCount });
        });
      }
    } else {
       // No keywords, restore all cards just in case
       const cards = document.querySelectorAll('ytd-rich-item-renderer, ytd-compact-video-renderer');
       cards.forEach(card => card.style.removeProperty('display'));
    }
  }
}

// MutationObserver for SPA changes
const observer = new MutationObserver(() => {
  cleanYouTube();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
