let recentlyRedirected = new Set();

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if URL is present in the changeInfo (SPA navigation) OR if the tab is just loading a new page
  const urlToEnable = changeInfo.url || tab.url;
  
  if (urlToEnable && urlToEnable.includes("youtube.com/shorts/")) {
    const blockUrl = chrome.runtime.getURL("block.html");
    
    if (urlToEnable !== blockUrl && !recentlyRedirected.has(tabId)) {
      recentlyRedirected.add(tabId);
      
      chrome.tabs.update(tabId, { url: blockUrl }, () => {
        chrome.storage.local.get({ shortsRedirected: 0 }, (data) => {
          chrome.storage.local.set({ shortsRedirected: data.shortsRedirected + 1 });
        });
      });
      
      // Keep lock for 3 seconds to prevent double counts from subsequent events on the same tab
      setTimeout(() => {
        recentlyRedirected.delete(tabId);
      }, 3000);
    }
  }
});

