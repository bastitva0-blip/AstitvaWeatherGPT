# WeatherGPT Chat — Chrome Extension

Simple popup chatbot that talks to the WeatherGPT backend `/api/query`.

## Load unpacked
1. `chrome://extensions` → enable Developer mode.
2. "Load unpacked" → select this `extension/` folder.
3. Click the toolbar icon to open the chat popup.

## Configure
Right-click the icon → Options (or the "Settings" link in the popup) to set:
- Backend API URL (default `http://localhost:8000`)
- API Key (default `test-key`, matches backend `API_KEYS` dev default)
