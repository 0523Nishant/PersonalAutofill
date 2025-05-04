// AutoFill Extension - Background Service Worker

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings on install
    const defaultSettings = {
      enabled: true,
      autoFillOnLoad: false,
      showFillNotification: true,
      fillOnlyEmpty: true,
      fillDelay: 200,
      mappingProfile: 'standard',
      trackHistory: true
    };
    
    chrome.storage.local.set({ 'autofill_settings': defaultSettings });
    
    // Open options page after installation
    chrome.runtime.openOptionsPage();
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle autofill request from popup
  if (message.action === 'autofillCurrentPage') {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        // Send message to content script
        chrome.tabs.sendMessage(tabs[0].id, { action: 'autofill' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            sendResponse(response);
          }
        });
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    return true; // Required to use sendResponse asynchronously
  }
  
  // Handle notification request
  if (message.action === 'showNotification') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon128.png',
      title: message.title || 'AutoFill Extension',
      message: message.message || '',
      priority: 0
    });
    sendResponse({ success: true });
    return false;
  }
});

// Add context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'autofill-context-menu',
    title: 'Autofill this form',
    contexts: ['page', 'editable']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'autofill-context-menu' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'autofill' });
  }
});

console.log('AutoFill Extension background script loaded');
