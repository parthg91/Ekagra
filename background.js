chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes("youtube.com/shorts/")) {
    const blockUrl = chrome.runtime.getURL("block.html");
    if (tab.url !== blockUrl) {
      chrome.tabs.update(tabId, { url: blockUrl }, () => {
        chrome.storage.local.get({ shortsRedirected: 0 }, (data) => {
          chrome.storage.local.set({ shortsRedirected: data.shortsRedirected + 1 });
        });
      });
    }
  }
});
