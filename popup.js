// Get DOM elements
const widthSlider = document.getElementById('width-slider');
const widthValue = document.getElementById('width-value');
const presetButtons = document.querySelectorAll('.preset-btn');
const statusDiv = document.getElementById('status');
const siteNameSpan = document.getElementById('site-name');

// Default width value
const DEFAULT_WIDTH = 80;

let currentSite = 'default';

// Detect which site the current tab is on
browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    if (tabs && tabs[0]) {
        const url = tabs[0].url || '';

        if (url.includes('gemini.google.com')) {
            currentSite = 'gemini';
        } else if (url.includes('chatgpt.com') || url.includes('openai.com')) {
            currentSite = 'chatgpt';
        } else if (url.includes('claude.ai')) {
            currentSite = 'claude';
        } else {
            currentSite = 'default';
        }

        console.log('Detected site:', currentSite, 'from URL:', url);

        // Update UI to show current site
        updateSiteDisplay();

        // Load saved settings for this site
        loadSettings();
    } else {
        console.error('No active tab found');
        // Still show UI with default settings
        updateSiteDisplay();
        loadSettings();
    }
}).catch((error) => {
    console.error('Error querying tabs:', error);
    // Still show UI with default settings
    updateSiteDisplay();
    loadSettings();
});

// Update the site name display
function updateSiteDisplay() {
    const siteNames = {
        'gemini': 'Google Gemini',
        'chatgpt': 'ChatGPT',
        'claude': 'Claude',
        'default': 'Unknown Site'
    };

    if (siteNameSpan) {
        siteNameSpan.textContent = siteNames[currentSite] || siteNames['default'];
    }
}

// Load saved settings for current site
function loadSettings() {
    browser.storage.sync.get(['widthSettings']).then((result) => {
        const widthSettings = result.widthSettings || {};
        const width = widthSettings[currentSite] || DEFAULT_WIDTH;
        console.log('Loaded width for', currentSite, ':', width);
        widthSlider.value = width;
        updateWidthDisplay(width);
    }).catch((error) => {
        console.error('Error loading settings:', error);
        // Use default width
        widthSlider.value = DEFAULT_WIDTH;
        updateWidthDisplay(DEFAULT_WIDTH);
    });
}

// Update the displayed width value
function updateWidthDisplay(width) {
    widthValue.textContent = `${width}rem`;
}

// Show status message
function showStatus(message) {
    statusDiv.textContent = message;
    setTimeout(() => {
        statusDiv.textContent = '';
    }, 2000);
}

// Save settings for current site
function saveSettings(width) {
    console.log('Saving width for', currentSite, ':', width);

    // Load existing settings first
    browser.storage.sync.get(['widthSettings']).then((result) => {
        const widthSettings = result.widthSettings || {};

        // Update the setting for current site
        widthSettings[currentSite] = width;

        // Save back to storage
        return browser.storage.sync.set({ widthSettings: widthSettings });
    }).then(() => {
        showStatus('Settings saved!');

        // Notify content scripts to update
        return browser.tabs.query({ active: true, currentWindow: true });
    }).then((tabs) => {
        if (tabs && tabs[0]) {
            return browser.tabs.sendMessage(tabs[0].id, {
                action: 'updateWidth',
                width: width
            }).catch(() => {
                // Ignore errors if content script isn't loaded
                console.log('Content script not available for immediate update');
            });
        }
    }).catch((error) => {
        console.error('Error saving settings:', error);
        showStatus('Error saving!');
    });
}

// Slider input handler
widthSlider.addEventListener('input', (e) => {
    const width = parseInt(e.target.value);
    updateWidthDisplay(width);
});

// Slider change handler (when user releases)
widthSlider.addEventListener('change', (e) => {
    const width = parseInt(e.target.value);
    saveSettings(width);
});

// Preset button handlers
presetButtons.forEach(button => {
    button.addEventListener('click', () => {
        const width = parseInt(button.dataset.width);
        widthSlider.value = width;
        updateWidthDisplay(width);
        saveSettings(width);
    });
});
