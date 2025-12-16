# Chat ViewFlex

A Firefox browser extension that provides flexible conversation width control for popular AI chat platforms.

## Overview

Chat ViewFlex automatically adjusts the conversation width on Google Gemini, ChatGPT, and Claude, making conversations easier to read on ultrawide monitors and large displays. The extension includes a user-friendly popup interface that allows you to customize the width for each platform independently.

## Features

- **Multi-Platform Support**: Works seamlessly with Google Gemini, ChatGPT, and Claude
- **Customizable Width**: Adjust conversation width from 40rem to 120rem using a slider
- **Per-Site Settings**: Each platform remembers its own width preference
- **Preset Options**: Quick-access buttons for Narrow (50rem), Medium (75rem), and Wide (100rem)
- **Real-Time Updates**: Changes apply instantly without requiring page refresh
- **Sync Across Devices**: Settings sync across Firefox installations when signed in

## Supported Platforms

- **Google Gemini** - gemini.google.com
- **ChatGPT** - chatgpt.com, chat.openai.com
- **Claude** - claude.ai

## Installation

### From Firefox Add-ons (Recommended)

1. Visit the [Chat ViewFlex page on Firefox Add-ons](https://addons.mozilla.org/firefox/addon/chat-viewflex/)
2. Click "Add to Firefox"
3. Confirm the installation

### Manual Installation (Development)

1. Clone or download this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from the extension directory
5. The extension will now be active until you restart Firefox

## Usage

1. **Navigate to a supported AI chat platform** (Gemini, ChatGPT, or Claude)
2. **Click the Chat ViewFlex icon** in your browser toolbar
3. **Adjust the width** using the slider or preset buttons
4. **Changes are saved automatically** and apply immediately

Each platform maintains its own independent width setting, so you can have different widths for Gemini, ChatGPT, and Claude based on your preference.

## Technical Details

### Architecture

The extension uses a `MutationObserver` pattern to dynamically detect and modify conversation width elements as they're added to the page. This ensures modifications persist even as the single-page applications navigate and load new content.

### Width Units

All widths use `rem` units (root em) rather than percentages to avoid compounding issues in nested elements. The default width is 80rem, which provides a comfortable reading experience on most displays.

### Storage

Settings are stored using Firefox's `browser.storage.sync` API, which:
- Persists across browser sessions
- Syncs across devices when signed into Firefox Sync
- Stores settings per-site for independent configuration

## Development

### Project Structure

```
chat-viewflex/
├── manifest.json          # Extension manifest
├── chat-viewflex.js      # Content script (modifies page width)
├── popup.html            # Settings UI
├── popup.js              # Settings logic
├── popup.css             # Settings styling
├── icons/                # Extension icons
├── images/               # Original image files of the extension icons
└── CLAUDE.md             # Developer documentation
```

### Testing

1. Load the extension as a temporary add-on (see Manual Installation above)
2. Navigate to supported platforms and verify width modifications
3. Test the popup interface for saving and loading settings
4. Check browser console for any errors or warnings

## Privacy

Chat ViewFlex does not collect, transmit, or store any user data beyond the width preferences saved locally in your browser. The extension:

- Does NOT track your browsing activity
- Does NOT collect conversation content
- Does NOT send data to external servers
- Only stores your width preferences using Firefox's local storage API

## Contributing

Contributions are welcome! If you encounter issues or have suggestions:

1. Check if an issue already exists
2. Open a new issue with detailed information
3. Submit a pull request with proposed changes

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE.txt) file for details.

## Changelog

### Version 0.5
- Medium preset to `80rem` from `75rem`
- Slider steps changed to `1` from `5`

### Version 0.4
- Perpetually in alpha; more for my own use than for release.
- Support for Google Gemini, ChatGPT, and Claude
- Per-site width settings
- Real-time width adjustment
- Preset width options

## Support

For issues, questions, or feedback, please visit the [GitHub Issues page](https://github.com/mk-imagine/chat-viewflex/issues).

## Acknowledgments

Built to enhance the AI chat experience on ultrawide monitors and large displays.
