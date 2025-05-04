// AutoFill Extension - Content Script
(() => {
  // Field identifiers - common patterns for form fields
  const FIELD_IDENTIFIERS = {
    firstName: ['first.*name', 'firstname', 'first-name', 'fname', 'given.*name', 'givenname'],
    lastName: ['last.*name', 'lastname', 'last-name', 'lname', 'surname', 'family.*name', 'familyname'],
    fullName: ['full.*name', 'fullname', 'name', 'your.*name'],
    email: ['email', 'e-mail', 'mail'],
    phone: ['phone', 'telephone', 'tel', 'mobile', 'cell'],
    address: ['address', 'street', 'addr', 'line1', 'address1', 'addressline1'],
    city: ['city', 'town', 'township'],
    state: ['state', 'province', 'region', 'county', 'district'],
    zipCode: ['zip', 'postal', 'postcode', 'postalcode', 'zip.*code'],
    country: ['country', 'nation'],
    cardNumber: ['card.*number', 'cardnumber', 'cc.*number', 'ccnumber', 'credit.*card', 'creditcard'],
    expDate: ['exp.*date', 'expiry', 'expiration', 'cc-exp', 'cc.*exp'],
    cvv: ['cvv', 'cvc', 'csc', 'cvv2', 'security.*code', 'securitycode'],
    cardholderName: ['cardholder', 'cardholder.*name', 'nameoncard', 'name.*on.*card'],
  };

  // Get user data and settings from storage
  const getUserData = () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get('autofill_user_data', (result) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(error);
        } else {
          resolve(result.autofill_user_data || null);
        }
      });
    });
  };

  const getSettings = () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get('autofill_settings', (result) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(error);
        } else {
          // Default settings
          const DEFAULT_SETTINGS = {
            enabled: true,
            autoFillOnLoad: false,
            showFillNotification: true,
            fillOnlyEmpty: true,
            fillDelay: 200,
            mappingProfile: 'standard',
            trackHistory: true
          };
          resolve({ ...DEFAULT_SETTINGS, ...result.autofill_settings });
        }
      });
    });
  };

  // Add an item to autofill history
  const addHistoryItem = (item) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get('autofill_history', (result) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(error);
          return;
        }
        
        const history = result.autofill_history || [];
        const updatedHistory = [item, ...history].slice(0, 50); // Limit to 50 items
        
        chrome.storage.local.set({ autofill_history: updatedHistory }, () => {
          const error = chrome.runtime.lastError;
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    });
  };

  // Helper to get the label text for an input element
  const getLabelForInput = (input) => {
    // Check for an associated label
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) {
        return label.textContent || '';
      }
    }
    
    // Check if the input is inside a label
    let parentEl = input.parentElement;
    while (parentEl) {
      if (parentEl.tagName === 'LABEL') {
        return parentEl.textContent || '';
      }
      parentEl = parentEl.parentElement;
    }
    
    return '';
  };

  // Find form fields and match them with user data
  const mapFieldsToUserData = (userData) => {
    const result = {};
    
    // Find all input elements
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach((input) => {
      // Get all the attributes we want to check
      const name = input.getAttribute('name') || '';
      const id = input.getAttribute('id') || '';
      const formControlName = input.getAttribute('formcontrolname') || '';
      const placeholder = input.getAttribute('placeholder') || '';
      const ariaLabel = input.getAttribute('aria-label') || '';
      const labelValue = getLabelForInput(input);
      
      // Create a string of all attributes to match against
      const fieldString = [name, id, formControlName, placeholder, ariaLabel, labelValue]
        .join(' ')
        .toLowerCase();
      
      // Check each field type against the identifiers
      Object.entries(FIELD_IDENTIFIERS).forEach(([field, patterns]) => {
        if (field in userData) {
          for (const pattern of patterns) {
            const regex = new RegExp(pattern, 'i');
            if (regex.test(fieldString)) {
              if (!result[field]) {
                result[field] = [];
              }
              result[field].push(input);
              break;
            }
          }
        }
      });
    });
    
    return result;
  };

  // Determine if a field should be filled
  const shouldFillInput = (input, settings) => {
    // Respect the fillOnlyEmpty setting
    if (settings.fillOnlyEmpty && input.value.trim() !== '') {
      return false;
    }

    // Skip hidden inputs
    if (input.type === 'hidden') {
      return false;
    }

    // Skip inputs with autocomplete="off"
    if (input.getAttribute('autocomplete') === 'off') {
      return false;
    }

    // Skip password fields
    if (input.type === 'password') {
      return false;
    }

    return true;
  };

  // Fill a form field with a value
  const fillField = (input, value) => {
    if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
      input.value = value;
      
      // Trigger input and change events
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (input instanceof HTMLSelectElement) {
      // Try to find a matching option
      const options = Array.from(input.options);
      const matchingOption = options.find(option => {
        return option.value === value || 
               option.text.toLowerCase() === value.toLowerCase();
      });
      
      if (matchingOption) {
        input.value = matchingOption.value;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  // Main function to fill form fields
  const autofillForm = async () => {
    try {
      // Get user data and settings
      const [userData, settings] = await Promise.all([
        getUserData(),
        getSettings()
      ]);
      
      if (!userData) {
        throw new Error('No user data found');
      }
      
      if (!settings.enabled) {
        throw new Error('Autofill is disabled');
      }
      
      // Find form fields on the page
      const fieldMap = mapFieldsToUserData(userData);
      let filledCount = 0;
      const failedFields = [];
      
      // Process each field type
      for (const [field, elements] of Object.entries(fieldMap)) {
        // Skip payment fields if they're disabled
        if (['cardNumber', 'expDate', 'cvv', 'cardholderName'].includes(field) && !userData.enablePayment) {
          continue;
        }
        
        // Get the value from user data
        const value = userData[field];
        if (!value) continue;
        
        // Fill each matching field
        for (const element of elements) {
          // Check if we should fill this input
          if (element instanceof HTMLInputElement && !shouldFillInput(element, settings)) {
            continue;
          }
          
          try {
            // Apply a delay if configured
            if (settings.fillDelay > 0) {
              await new Promise(resolve => setTimeout(resolve, settings.fillDelay));
            }
            
            // Fill the field
            fillField(element, value);
            filledCount++;
          } catch (error) {
            console.error(`Failed to fill ${field}:`, error);
            failedFields.push(field);
          }
        }
      }
      
      // Determine overall status
      let status = 'success';
      let message = '';
      
      if (filledCount === 0) {
        status = 'error';
        message = 'No fields could be filled';
      } else if (failedFields.length > 0) {
        status = 'partial';
        message = `${filledCount} fields filled, ${failedFields.length} failed: ${failedFields.join(', ')}`;
      } else {
        message = `${filledCount} fields filled successfully`;
      }
      
      // Record in history if tracking is enabled
      if (settings.trackHistory) {
        const historyItem = {
          timestamp: Date.now(),
          domain: document.location.hostname,
          filledCount,
          status,
          message
        };
        
        await addHistoryItem(historyItem);
      }
      
      // Show notification if enabled
      if (settings.showFillNotification) {
        chrome.runtime.sendMessage({
          action: 'showNotification',
          title: 'AutoFill Complete',
          message
        });
      }
      
      return { status, filledCount, failedFields, message };
    } catch (error) {
      console.error('Autofill error:', error);
      throw error;
    }
  };

  // Listen for messages from the extension
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'autofill') {
      autofillForm()
        .then(result => sendResponse({ success: true, ...result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Required to use sendResponse asynchronously
    }
  });

  // Auto-fill on page load if enabled
  const checkAutoFillOnLoad = async () => {
    try {
      const settings = await getSettings();
      if (settings.enabled && settings.autoFillOnLoad) {
        // Wait a moment for the page to fully render
        setTimeout(autofillForm, 1000);
      }
    } catch (error) {
      console.error('Error checking auto-fill settings:', error);
    }
  };

  // Check if we should auto-fill on load
  if (document.readyState === 'complete') {
    checkAutoFillOnLoad();
  } else {
    window.addEventListener('load', checkAutoFillOnLoad);
  }

  console.log('AutoFill Extension content script loaded');
})();
