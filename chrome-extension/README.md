# Memex Dashboard Chrome Extension

This Chrome extension allows you to save web content directly to your Memex Dashboard.

## Features
- Save entire pages
- Save selected text
- Right-click context menu integration
- Quick access via extension popup

## Setup
1. Update the API_BASE_URL in `background/background.js` to match your dashboard URL
2. Add extension icons (16x16, 48x48, 128x128) to the `icons/` directory
3. Update host_permissions in manifest.json with your production URL

## Installation
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-extension` directory

## API Integration
The extension expects an API endpoint at `/api/chrome-extension/save` that accepts:
```json
{
  "url": "string",
  "title": "string",
  "selection": "string (optional)"
}
```