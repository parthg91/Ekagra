document.addEventListener('DOMContentLoaded', () => {
  const shortsBlockedEl = document.getElementById('shortsBlocked');
  const itemsFilteredEl = document.getElementById('itemsFiltered');
  const mokshaToggle = document.getElementById('mokshaToggle');
  const keywordInput = document.getElementById('keywordInput');
  const addBtn = document.getElementById('addBtn');
  const keywordList = document.getElementById('keywordList');

  // Load state
  chrome.storage.local.get({
    shortsRedirected: 0,
    itemsFiltered: 0,
    isMokshaActive: false,
    bannedKeywords: []
  }, (data) => {
    shortsBlockedEl.textContent = data.shortsRedirected;
    itemsFilteredEl.textContent = data.itemsFiltered;
    mokshaToggle.checked = data.isMokshaActive;
    renderKeywords(data.bannedKeywords);
  });

  // Watch for analytics updates in realtime while popup is open
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
      if (changes.shortsRedirected) {
        shortsBlockedEl.textContent = changes.shortsRedirected.newValue;
      }
      if (changes.itemsFiltered) {
        itemsFilteredEl.textContent = changes.itemsFiltered.newValue;
      }
    }
  });

  // Toggle listener
  mokshaToggle.addEventListener('change', (e) => {
    const isActive = e.target.checked;
    chrome.storage.local.get({ bannedKeywords: [] }, (data) => {
      chrome.storage.local.set({ isMokshaActive: isActive }, () => {
        notifyContentScript(isActive, data.bannedKeywords);
      });
    });
  });

  // Add keyword
  addBtn.addEventListener('click', addKeyword);
  keywordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addKeyword();
  });

  function addKeyword() {
    const kw = keywordInput.value.trim();
    if (!kw) return;
    
    chrome.storage.local.get({ bannedKeywords: [], isMokshaActive: false }, (data) => {
      const keywords = data.bannedKeywords;
      if (!keywords.map(k => k.toLowerCase()).includes(kw.toLowerCase())) {
        keywords.push(kw);
        chrome.storage.local.set({ bannedKeywords: keywords }, () => {
          keywordInput.value = '';
          renderKeywords(keywords);
          notifyContentScript(data.isMokshaActive, keywords);
        });
      }
    });
  }

  // Remove keyword
  function removeKeyword(kwToRemove) {
    chrome.storage.local.get({ bannedKeywords: [], isMokshaActive: false }, (data) => {
      const keywords = data.bannedKeywords.filter(kw => kw !== kwToRemove);
      chrome.storage.local.set({ bannedKeywords: keywords }, () => {
        renderKeywords(keywords);
        notifyContentScript(data.isMokshaActive, keywords);
      });
    });
  }

  // Render list
  function renderKeywords(keywords) {
    keywordList.innerHTML = '';
    keywords.forEach(kw => {
      const item = document.createElement('div');
      item.className = 'keyword-item';
      
      const text = document.createElement('span');
      text.textContent = kw;
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = '✕';
      removeBtn.onclick = () => removeKeyword(kw);
      
      item.appendChild(text);
      item.appendChild(removeBtn);
      keywordList.appendChild(item);
    });
  }

  // Send message to active tab
  function notifyContentScript(isMokshaActive, bannedKeywords) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes("youtube.com")) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'UPDATE_STATE',
          isMokshaActive,
          bannedKeywords
        }).catch(err => console.log('Content script not ready or active tab is not YouTube', err));
      }
    });
  }
});
