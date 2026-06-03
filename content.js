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
  // ----------------------------------------------------
  // Rule A: Ad Annihilation & Shorts UI (Always Active)
  // ----------------------------------------------------

  // 1. Hide Ad Elements
  const adSelectors = [
    'ytd-ad-slot-renderer',
    'ytd-promoted-sparkles-web-renderer',
    'ytd-in-feed-ad-layout-renderer',
    'ytd-banner-promo-renderer',
    '.ytd-video-masthead-ad-v3-renderer',
    'ytd-action-companion-ad-renderer',
    '#masthead-ad',
    '#player-ads',
    'ytd-player-legacy-desktop-watch-ads-renderer',
    'ytd-promoted-video-renderer',
    'ytd-search-pyv-renderer',
    'div#merch-shelf'
  ];

  adSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
  });

  // 2. Auto-Clicker for Ads & Video Ad Skipper
  const skipButtons = document.querySelectorAll('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button');
  skipButtons.forEach(btn => {
    if (btn && typeof btn.click === 'function') {
      btn.click();
    }
  });

  const adPlayer = document.querySelector('.ad-showing video');
  if (adPlayer && !isNaN(adPlayer.duration)) {
    if (adPlayer.currentTime < adPlayer.duration - 0.5) {
      // Fast forward to just before the end so YouTube registers the natural completion event
      adPlayer.currentTime = adPlayer.duration - 0.1;
    }
  }

  // 3. Hide Shorts Everywhere
  const shortsShelves = document.querySelectorAll('ytd-reel-shelf-renderer, ytd-rich-shelf-renderer[is-shorts]');
  shortsShelves.forEach(el => el.style.setProperty('display', 'none', 'important'));

  document.querySelectorAll('a[href*="/shorts/"]').forEach(link => {
    const card = link.closest('ytd-video-renderer, ytd-grid-video-renderer, ytd-rich-item-renderer, ytd-reel-item-renderer, ytd-compact-video-renderer');
    if (card) {
      card.style.setProperty('display', 'none', 'important');
    }
  });

  document.querySelectorAll('yt-tab-shape[tab-title="Shorts"], ytd-guide-entry-renderer a[href*="/shorts/"]').forEach(el => {
    const parent = el.closest('yt-tab-shape, ytd-guide-entry-renderer');
    if (parent) {
      parent.style.setProperty('display', 'none', 'important');
    }
  });

  // ----------------------------------------------------
  // Rule B: Moksha Protocol
  // ----------------------------------------------------
  const feed = document.querySelector('ytd-browse[page-subtype="home"]'); 
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

    // ----------------------------------------------------
    // Rule C: Keyword Filter
    // ----------------------------------------------------
    if (bannedKeywords && bannedKeywords.length > 0) {
      let filteredCount = 0;
      const cards = document.querySelectorAll('ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-video-renderer, ytd-grid-video-renderer');
      
      cards.forEach(card => {
        const titleEl = card.querySelector('#video-title, #video-title-link, yt-formatted-string.ytd-video-renderer, h3');
        const titleText = (titleEl ? titleEl.textContent : card.textContent).toLowerCase();
        
        const shouldHide = bannedKeywords.some(kw => titleText.includes(kw.toLowerCase()));
        
        if (shouldHide) {
          if (!card.hasAttribute('data-ekagra-filtered')) {
            card.setAttribute('data-ekagra-filtered', 'true');
            card.style.setProperty('display', 'none', 'important');
            filteredCount++;
          }
        } else {
           if (!card.querySelector('a[href*="/shorts/"]')) {
             card.removeAttribute('data-ekagra-filtered');
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
       const cards = document.querySelectorAll('ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-video-renderer, ytd-grid-video-renderer');
       cards.forEach(card => {
         if (!card.querySelector('a[href*="/shorts/"]')) {
           card.removeAttribute('data-ekagra-filtered');
           card.style.removeProperty('display');
         }
       });
    }
  }
}

// ----------------------------------------------------
// Performance Optimization: requestAnimationFrame Batching
// ----------------------------------------------------
// Instead of running cleanYouTube on every single DOM node insertion,
// we batch the updates using requestAnimationFrame. This eliminates visual 
// flickering and drastically reduces CPU usage during infinite scrolling.
let isCleaning = false;
const observer = new MutationObserver(() => {
  if (!isCleaning) {
    isCleaning = true;
    requestAnimationFrame(() => {
      cleanYouTube();
      isCleaning = false;
    });
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
