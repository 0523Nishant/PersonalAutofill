import { getUserData, getSettings, addAutofillHistoryItem } from './storage';
import { UserData, Settings, AutofillHistoryItem, AutofillResult } from './types';

// Common form field types and their identifiers
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

// Helper function to determine if input should be filled
const shouldFillInput = (input: HTMLInputElement, settings: Settings): boolean => {
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

  // Skip password fields unless specifically enabled
  if (input.type === 'password') {
    return false;
  }

  return true;
};

// Helper function to find relevant fields and match them with user data
const mapFieldsToUserData = (userData: UserData): { [key: string]: HTMLElement[] } => {
  const result: { [key: string]: HTMLElement[] } = {};
  
  // Find all input elements
  const inputs = document.querySelectorAll('input, select, textarea');
  
  inputs.forEach((input) => {
    if (!(input instanceof HTMLElement)) return;
    
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

// Helper function to get the label text for an input
const getLabelForInput = (input: HTMLElement): string => {
  // Check for an associated label
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) {
      return label.textContent || '';
    }
  }
  
  // Check if the input is inside a label
  let parentEl: HTMLElement | null = input.parentElement;
  while (parentEl) {
    if (parentEl.tagName === 'LABEL') {
      return parentEl.textContent || '';
    }
    parentEl = parentEl.parentElement;
  }
  
  return '';
};

// Helper function to fill a form field
const fillField = (input: HTMLElement, value: string): void => {
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

// Main function to trigger autofill
export const triggerAutofill = async (): Promise<AutofillResult> => {
  // Get user data and settings
  const userData = await getUserData();
  const settings = await getSettings();
  
  if (!userData) {
    throw new Error('No user data found');
  }
  
  if (!settings.enabled) {
    throw new Error('Autofill is disabled');
  }
  
  // Find form fields on the page
  const fieldMap = mapFieldsToUserData(userData);
  let filledCount = 0;
  const failedFields: string[] = [];
  
  // Process each field type
  for (const [field, elements] of Object.entries(fieldMap)) {
    // Skip payment fields if they're disabled
    if (['cardNumber', 'expDate', 'cvv', 'cardholderName'].includes(field) && !userData.enablePayment) {
      continue;
    }
    
    // Get the value from user data
    const value = (userData as any)[field];
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
  let status: 'success' | 'partial' | 'error' = 'success';
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
    const historyItem: AutofillHistoryItem = {
      timestamp: Date.now(),
      domain: document.location.hostname,
      filledCount,
      status,
      message
    };
    
    try {
      await addAutofillHistoryItem(historyItem);
    } catch (error) {
      console.error('Failed to save history item:', error);
    }
  }
  
  // Show notification if enabled
  if (settings.showFillNotification && typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({
      action: 'showNotification',
      title: 'AutoFill Complete',
      message
    });
  }
  
  return {
    status,
    filledCount,
    failedFields,
    message
  };
};

// Function to set up automatic form filling when page loads
export const setupAutofillOnLoad = async (): Promise<void> => {
  const settings = await getSettings();
  
  if (settings.enabled && settings.autoFillOnLoad) {
    // Wait for the page to be fully loaded and forms to be rendered
    if (document.readyState === 'complete') {
      await triggerAutofill().catch(console.error);
    } else {
      window.addEventListener('load', async () => {
        // Additional delay to ensure dynamic forms are loaded
        setTimeout(async () => {
          await triggerAutofill().catch(console.error);
        }, 500);
      });
    }
  }
};
