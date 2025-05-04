// Popup script for Personal Autofill

document.addEventListener('DOMContentLoaded', () => {
  // Tab navigation
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all tabs
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));
      
      // Set active class on clicked tab
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });
  
  // Fill form button
  document.getElementById('fill-form-btn').addEventListener('click', () => {
    // Send message to background script to initiate autofill
    chrome.runtime.sendMessage({ action: 'autofillCurrentPage' }, (response) => {
      if (response && response.success) {
        displayStatus(`Autofill complete: ${response.message}`);
      } else {
        displayStatus(`Autofill failed: ${response?.error || 'Unknown error'}`);
      }
    });
  });
  
  // Edit profile button
  document.getElementById('edit-profile-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Options button
  document.getElementById('options-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Settings controls
  const settingsControls = {
    'enable-autofill': 'enabled',
    'autofill-on-load': 'autoFillOnLoad',
    'show-notifications': 'showFillNotification',
    'fill-only-empty': 'fillOnlyEmpty'
  };
  
  // Load settings
  loadSettings().then(settings => {
    // Set checkbox states based on settings
    Object.entries(settingsControls).forEach(([elementId, settingKey]) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.checked = settings[settingKey];
        
        // Add change listener
        element.addEventListener('change', () => {
          settings[settingKey] = element.checked;
          saveSettings(settings);
        });
      }
    });
  });
  
  // Load history
  loadHistory().then(displayHistory);
  
  // Clear history button
  document.getElementById('clear-history-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your autofill history?')) {
      clearHistory().then(() => {
        displayHistory([]);
        displayStatus('History has been cleared');
      });
    }
  });
  
  // Load and display user profile summary
  loadUserData().then(displayProfileSummary);
});

// Load settings from storage
function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get('autofill_settings', (result) => {
      const defaultSettings = {
        enabled: true,
        autoFillOnLoad: false,
        showFillNotification: true,
        fillOnlyEmpty: true,
        fillDelay: 200,
        mappingProfile: 'standard',
        trackHistory: true
      };
      
      resolve(result.autofill_settings || defaultSettings);
    });
  });
}

// Save settings to storage
function saveSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ 'autofill_settings': settings }, resolve);
  });
}

// Load history from storage
function loadHistory() {
  return new Promise((resolve) => {
    chrome.storage.local.get('autofill_history', (result) => {
      resolve(result.autofill_history || []);
    });
  });
}

// Clear history from storage
function clearHistory() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ 'autofill_history': [] }, resolve);
  });
}

// Load user data from storage
function loadUserData() {
  return new Promise((resolve) => {
    chrome.storage.local.get('autofill_user_data', (result) => {
      resolve(result.autofill_user_data || null);
    });
  });
}

// Display profile summary
function displayProfileSummary(userData) {
  const profileTab = document.getElementById('profile-tab');
  
  // Clear existing content
  while (profileTab.firstChild && profileTab.firstChild.tagName !== 'BUTTON') {
    profileTab.removeChild(profileTab.firstChild);
  }
  
  if (!userData) {
    const message = document.createElement('p');
    message.textContent = 'No profile information found. Click "Edit Profile" to set up your data.';
    profileTab.insertBefore(message, profileTab.firstChild);
    return;
  }
  
  // Create profile summary
  const summary = document.createElement('div');
  summary.className = 'profile-summary';
  
  // Basic info
  const name = document.createElement('h3');
  name.textContent = userData.firstName + ' ' + userData.lastName;
  summary.appendChild(name);
  
  const email = document.createElement('p');
  email.innerHTML = `<strong>Email:</strong> ${userData.email || 'Not set'}`;
  summary.appendChild(email);
  
  const phone = document.createElement('p');
  phone.innerHTML = `<strong>Phone:</strong> ${userData.phone || 'Not set'}`;
  summary.appendChild(phone);
  
  // Insert before buttons
  profileTab.insertBefore(summary, document.getElementById('edit-profile-btn'));
  
  // Add spacing
  const spacer = document.createElement('div');
  spacer.style.marginBottom = '16px';
  profileTab.insertBefore(spacer, document.getElementById('edit-profile-btn'));
}

// Display history items
function displayHistory(historyItems) {
  const historyList = document.querySelector('.history-list');
  
  // Clear existing items
  historyList.innerHTML = '';
  
  if (!historyItems || historyItems.length === 0) {
    const message = document.createElement('p');
    message.textContent = 'No history found. Use the extension to autofill forms and your history will appear here.';
    historyList.appendChild(message);
    return;
  }
  
  // Add each history item
  historyItems.slice(0, 10).forEach(item => {  // Show only the 10 most recent
    const historyItem = document.createElement('div');
    historyItem.className = `history-item history-${item.status}`;
    
    const header = document.createElement('div');
    header.className = 'history-item-header';
    
    const domain = document.createElement('span');
    domain.className = 'history-domain';
    domain.textContent = item.domain;
    header.appendChild(domain);
    
    const time = document.createElement('span');
    time.className = 'history-time';
    time.textContent = new Date(item.timestamp).toLocaleString();
    header.appendChild(time);
    
    historyItem.appendChild(header);
    
    const details = document.createElement('div');
    details.className = 'history-details';
    
    const filledCount = document.createElement('span');
    filledCount.textContent = `${item.filledCount} fields filled`;
    details.appendChild(filledCount);
    
    const status = document.createElement('span');
    status.className = `history-status ${item.status}`;
    status.textContent = item.status.charAt(0).toUpperCase() + item.status.slice(1);
    details.appendChild(status);
    
    historyItem.appendChild(details);
    
    if (item.message) {
      const message = document.createElement('div');
      message.className = 'history-message';
      message.textContent = item.message;
      historyItem.appendChild(message);
    }
    
    historyList.appendChild(historyItem);
  });
}

// Display status message (can be used for notifications)
function displayStatus(message) {
  // Create status element if it doesn't exist
  let statusElement = document.getElementById('status-message');
  if (!statusElement) {
    statusElement = document.createElement('div');
    statusElement.id = 'status-message';
    statusElement.style.position = 'fixed';
    statusElement.style.bottom = '16px';
    statusElement.style.left = '50%';
    statusElement.style.transform = 'translateX(-50%)';
    statusElement.style.padding = '8px 16px';
    statusElement.style.backgroundColor = '#4F46E5';
    statusElement.style.color = 'white';
    statusElement.style.borderRadius = '4px';
    statusElement.style.zIndex = '1000';
    statusElement.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    document.body.appendChild(statusElement);
  }
  
  // Update message and show
  statusElement.textContent = message;
  statusElement.style.display = 'block';
  
  // Hide after 3 seconds
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
}