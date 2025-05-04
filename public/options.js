// Options page script for Personal Autofill

document.addEventListener('DOMContentLoaded', () => {
  // Section navigation
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.options-section');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all items and sections
      navItems.forEach(i => i.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      
      // Set active class on clicked item and corresponding section
      item.classList.add('active');
      const sectionId = `${item.getAttribute('data-section')}-section`;
      document.getElementById(sectionId).classList.add('active');
    });
  });
  
  // Profile form
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    // Load user data into form
    loadUserData().then(userData => {
      if (userData) {
        fillProfileForm(userData);
      }
    });
    
    // Toggle payment fields visibility
    const enablePaymentCheckbox = document.getElementById('enablePayment');
    const paymentFields = document.getElementById('payment-fields');
    
    if (enablePaymentCheckbox && paymentFields) {
      enablePaymentCheckbox.addEventListener('change', () => {
        paymentFields.classList.toggle('hidden', !enablePaymentCheckbox.checked);
      });
    }
    
    // Resume file input handler
    const resumeFileInput = document.getElementById('resumeFile');
    if (resumeFileInput) {
      resumeFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
          // Store the filename for display
          document.getElementById('resumeFile').setAttribute('data-filename', file.name);
        }
      });
    }
    
    // Handle form submission
    profileForm.addEventListener('submit', (event) => {
      event.preventDefault();
      
      // Get form data
      const formData = new FormData(profileForm);
      const userData = {};
      
      // Convert form data to object
      for (const [key, value] of formData.entries()) {
        if (key === 'enablePayment') {
          userData[key] = true; // Checkbox is only included if checked
        } else if (key === 'resumeFile') {
          // Skip file input, we'll handle it separately
          continue;
        } else {
          userData[key] = value;
        }
      }
      
      // Handle file input separately if a file was selected
      const resumeFileInput = document.getElementById('resumeFile');
      if (resumeFileInput.files && resumeFileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          userData.resumeFile = e.target.result; // Base64 encoded file
          saveUserData(userData);
        };
        reader.readAsDataURL(resumeFileInput.files[0]);
      } else {
        // If no new file was selected, preserve any existing file data
        loadUserData().then(existingData => {
          if (existingData && existingData.resumeFile) {
            userData.resumeFile = existingData.resumeFile;
          }
          saveUserData(userData);
        });
      }
    });
    
    // Reset form button
    document.getElementById('reset-profile').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset the form? All unsaved changes will be lost.')) {
        profileForm.reset();
        // Also hide payment fields
        const paymentFields = document.getElementById('payment-fields');
        if (paymentFields) {
          paymentFields.classList.add('hidden');
        }
      }
    });
  }
  
  // Settings form
  const settingsForm = document.getElementById('settings-form');
  if (settingsForm) {
    // Load settings into form
    loadSettings().then(settings => {
      fillSettingsForm(settings);
    });
    
    // Handle form submission
    settingsForm.addEventListener('submit', (event) => {
      event.preventDefault();
      
      // Get form data
      const formData = new FormData(settingsForm);
      const settings = {
        enabled: false,
        autoFillOnLoad: false,
        showFillNotification: false,
        fillOnlyEmpty: false,
        trackHistory: false
      };
      
      // Set boolean values based on checkbox presence
      settings.enabled = formData.has('enabled');
      settings.autoFillOnLoad = formData.has('autoFillOnLoad');
      settings.showFillNotification = formData.has('showFillNotification');
      settings.fillOnlyEmpty = formData.has('fillOnlyEmpty');
      settings.trackHistory = formData.has('trackHistory');
      
      // Set numeric value for fillDelay
      const fillDelay = parseInt(formData.get('fillDelay'), 10);
      settings.fillDelay = isNaN(fillDelay) ? 200 : Math.max(0, Math.min(1000, fillDelay));
      
      // Get mapping profile
      settings.mappingProfile = document.getElementById('mapping-profile-select')?.value || 'standard';
      
      saveSettings(settings).then(() => {
        displayNotification('Settings saved successfully');
      });
    });
    
    // Reset settings button
    document.getElementById('reset-settings').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all settings to defaults?')) {
        const defaultSettings = {
          enabled: true,
          autoFillOnLoad: false,
          showFillNotification: true,
          fillOnlyEmpty: true,
          fillDelay: 200,
          mappingProfile: 'standard',
          trackHistory: true
        };
        
        fillSettingsForm(defaultSettings);
        saveSettings(defaultSettings).then(() => {
          displayNotification('Settings reset to defaults');
        });
      }
    });
  }
  
  // Field mapping
  const mappingProfileSelect = document.getElementById('mapping-profile-select');
  if (mappingProfileSelect) {
    // Load current mapping profile
    loadSettings().then(settings => {
      mappingProfileSelect.value = settings.mappingProfile || 'standard';
      
      // Load field mappings
      loadFieldMappings(mappingProfileSelect.value);
    });
    
    // Handle profile selection change
    mappingProfileSelect.addEventListener('change', () => {
      loadFieldMappings(mappingProfileSelect.value);
    });
    
    // New profile button
    document.getElementById('new-profile-btn').addEventListener('click', () => {
      const profileName = prompt('Enter a name for the new mapping profile:');
      if (profileName) {
        createNewMappingProfile(profileName);
      }
    });
    
    // Save mapping button
    document.getElementById('save-mapping').addEventListener('click', () => {
      saveCurrentMappingProfile().then(() => {
        displayNotification('Field mappings saved successfully');
      });
    });
    
    // Reset mapping button
    document.getElementById('reset-mapping').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset the current mapping profile?')) {
        resetCurrentMappingProfile().then(() => {
          displayNotification('Field mappings reset to defaults');
        });
      }
    });
  }
  
  // History section
  const historyTableBody = document.getElementById('history-table-body');
  if (historyTableBody) {
    // Load history
    loadHistory().then(displayHistoryTable);
    
    // Search history
    const historySearch = document.getElementById('history-search');
    if (historySearch) {
      historySearch.addEventListener('input', () => {
        loadHistory().then(history => {
          displayHistoryTable(history, historySearch.value.toLowerCase());
        });
      });
    }
    
    // Clear all history button
    document.getElementById('clear-all-history').addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all autofill history?')) {
        clearHistory().then(() => {
          displayHistoryTable([]);
          displayNotification('All history has been cleared');
        });
      }
    });
  }
});

// Load user data from storage
function loadUserData() {
  return new Promise((resolve) => {
    chrome.storage.local.get('autofill_user_data', (result) => {
      resolve(result.autofill_user_data || null);
    });
  });
}

// Save user data to storage
function saveUserData(userData) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ 'autofill_user_data': userData }, () => {
      displayNotification('Profile saved successfully');
      resolve();
    });
  });
}

// Fill profile form with user data
function fillProfileForm(userData) {
  // Basic fields
  for (const [key, value] of Object.entries(userData)) {
    const element = document.getElementById(key);
    if (!element) continue;
    
    if (element.type === 'checkbox') {
      element.checked = value;
      
      // Toggle visibility of payment fields
      if (key === 'enablePayment') {
        const paymentFields = document.getElementById('payment-fields');
        if (paymentFields) {
          paymentFields.classList.toggle('hidden', !value);
        }
      }
    } else if (element.type === 'file') {
      // Skip file input, we can't set its value directly
      // But we can show the filename if available
      if (value) {
        element.setAttribute('data-filename', 'Resume file already uploaded');
      }
    } else {
      element.value = value;
    }
  }
}

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

// Fill settings form with settings
function fillSettingsForm(settings) {
  // Checkboxes
  document.getElementById('settings-enabled').checked = settings.enabled;
  document.getElementById('settings-autoFillOnLoad').checked = settings.autoFillOnLoad;
  document.getElementById('settings-showFillNotification').checked = settings.showFillNotification;
  document.getElementById('settings-fillOnlyEmpty').checked = settings.fillOnlyEmpty;
  document.getElementById('settings-trackHistory').checked = settings.trackHistory;
  
  // Fill delay
  document.getElementById('settings-fillDelay').value = settings.fillDelay;
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

// Load field mappings
function loadFieldMappings(profileName) {
  // Get mappings from storage
  chrome.storage.local.get('autofill_mappings', (result) => {
    const mappings = result.autofill_mappings || {};
    const profileMappings = mappings[profileName] || getDefaultMappings();
    
    // Display mappings
    displayFieldMappings(profileMappings);
  });
}

// Get default field mappings
function getDefaultMappings() {
  return {
    firstName: ['first.*name', 'firstname', 'first-name', 'fname'],
    lastName: ['last.*name', 'lastname', 'last-name', 'lname'],
    email: ['email', 'e-mail'],
    phone: ['phone', 'telephone', 'tel', 'mobile'],
    address: ['address', 'street', 'addr'],
    city: ['city', 'town'],
    state: ['state', 'province', 'region'],
    zipCode: ['zip', 'postal', 'postcode'],
    country: ['country', 'nation']
  };
}

// Display field mappings in the UI
function displayFieldMappings(mappings) {
  const fieldMapList = document.querySelector('.field-map-list');
  fieldMapList.innerHTML = '';
  
  // Create a field mapping entry for each field
  for (const [field, patterns] of Object.entries(mappings)) {
    const fieldEntry = document.createElement('div');
    fieldEntry.className = 'field-mapping-entry';
    
    const fieldLabel = document.createElement('label');
    fieldLabel.textContent = formatFieldName(field);
    fieldEntry.appendChild(fieldLabel);
    
    const patternInput = document.createElement('input');
    patternInput.type = 'text';
    patternInput.className = 'mapping-patterns';
    patternInput.setAttribute('data-field', field);
    patternInput.value = patterns.join(', ');
    fieldEntry.appendChild(patternInput);
    
    fieldMapList.appendChild(fieldEntry);
  }
}

// Format field name for display
function formatFieldName(fieldName) {
  // Split by camelCase
  const formatted = fieldName.replace(/([A-Z])/g, ' $1')
    // Replace underscores with spaces
    .replace(/_/g, ' ')
    // Capitalize first letter
    .replace(/^./, (str) => str.toUpperCase());
  
  return formatted;
}

// Create a new mapping profile
function createNewMappingProfile(profileName) {
  // Get existing mappings
  chrome.storage.local.get('autofill_mappings', (result) => {
    const mappings = result.autofill_mappings || {};
    
    // Create new profile with default mappings
    mappings[profileName] = getDefaultMappings();
    
    // Save mappings
    chrome.storage.local.set({ 'autofill_mappings': mappings }, () => {
      // Update select element
      const select = document.getElementById('mapping-profile-select');
      const option = document.createElement('option');
      option.value = profileName;
      option.textContent = profileName;
      select.appendChild(option);
      select.value = profileName;
      
      // Display mappings
      displayFieldMappings(mappings[profileName]);
      displayNotification(`New mapping profile "${profileName}" created`);
    });
  });
}

// Save current mapping profile
function saveCurrentMappingProfile() {
  return new Promise((resolve) => {
    const profileName = document.getElementById('mapping-profile-select').value;
    const mappingEntries = document.querySelectorAll('.mapping-patterns');
    
    // Create mappings object
    const profileMappings = {};
    mappingEntries.forEach(entry => {
      const field = entry.getAttribute('data-field');
      const patterns = entry.value.split(',').map(p => p.trim()).filter(p => p);
      profileMappings[field] = patterns;
    });
    
    // Get existing mappings
    chrome.storage.local.get('autofill_mappings', (result) => {
      const mappings = result.autofill_mappings || {};
      
      // Update profile
      mappings[profileName] = profileMappings;
      
      // Save mappings
      chrome.storage.local.set({ 'autofill_mappings': mappings }, resolve);
    });
  });
}

// Reset current mapping profile
function resetCurrentMappingProfile() {
  return new Promise((resolve) => {
    const profileName = document.getElementById('mapping-profile-select').value;
    
    // Get default mappings
    const defaultMappings = getDefaultMappings();
    
    // Get existing mappings
    chrome.storage.local.get('autofill_mappings', (result) => {
      const mappings = result.autofill_mappings || {};
      
      // Reset profile
      mappings[profileName] = defaultMappings;
      
      // Save mappings
      chrome.storage.local.set({ 'autofill_mappings': mappings }, () => {
        // Display mappings
        displayFieldMappings(defaultMappings);
        resolve();
      });
    });
  });
}

// Display history in table
function displayHistoryTable(historyItems, searchTerm = '') {
  const tableBody = document.getElementById('history-table-body');
  tableBody.innerHTML = '';
  
  // Filter by search term if provided
  const filteredItems = searchTerm
    ? historyItems.filter(item => {
        return item.domain.toLowerCase().includes(searchTerm) ||
               item.message?.toLowerCase().includes(searchTerm);
      })
    : historyItems;
  
  if (filteredItems.length === 0) {
    const emptyRow = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 4;
    emptyCell.textContent = 'No history found';
    emptyCell.style.textAlign = 'center';
    emptyCell.style.padding = '24px';
    emptyRow.appendChild(emptyCell);
    tableBody.appendChild(emptyRow);
    return;
  }
  
  // Add each history item
  filteredItems.forEach(item => {
    const row = document.createElement('tr');
    
    const timeCell = document.createElement('td');
    timeCell.textContent = new Date(item.timestamp).toLocaleString();
    row.appendChild(timeCell);
    
    const domainCell = document.createElement('td');
    domainCell.textContent = item.domain;
    row.appendChild(domainCell);
    
    const filledCell = document.createElement('td');
    filledCell.textContent = item.filledCount;
    row.appendChild(filledCell);
    
    const statusCell = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.className = `history-status ${item.status}`;
    statusBadge.textContent = item.status.charAt(0).toUpperCase() + item.status.slice(1);
    statusCell.appendChild(statusBadge);
    
    if (item.message) {
      const message = document.createElement('div');
      message.className = 'history-message';
      message.style.fontSize = '12px';
      message.style.marginTop = '4px';
      message.textContent = item.message;
      statusCell.appendChild(message);
    }
    
    row.appendChild(statusCell);
    
    tableBody.appendChild(row);
  });
}

// Display notification
function displayNotification(message) {
  // Create notification element if it doesn't exist
  let notificationElement = document.getElementById('notification');
  if (!notificationElement) {
    notificationElement = document.createElement('div');
    notificationElement.id = 'notification';
    notificationElement.style.position = 'fixed';
    notificationElement.style.top = '24px';
    notificationElement.style.right = '24px';
    notificationElement.style.padding = '12px 24px';
    notificationElement.style.backgroundColor = '#4F46E5';
    notificationElement.style.color = 'white';
    notificationElement.style.borderRadius = '4px';
    notificationElement.style.zIndex = '1000';
    notificationElement.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    notificationElement.style.opacity = '0';
    notificationElement.style.transition = 'opacity 0.3s ease';
    document.body.appendChild(notificationElement);
  }
  
  // Update message and show
  notificationElement.textContent = message;
  notificationElement.style.opacity = '1';
  
  // Hide after 3 seconds
  setTimeout(() => {
    notificationElement.style.opacity = '0';
  }, 3000);
}