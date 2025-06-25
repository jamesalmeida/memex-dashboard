const API_BASE_URL = 'http://localhost:3000/api'; // Update this for production

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'savePage') {
    saveToDashboard(request.data)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'saveSelection') {
    saveToDashboard(request.data)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

chrome.contextMenus.create({
  id: "saveToMemex",
  title: "Save to Memex Dashboard",
  contexts: ["selection", "page"]
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const data = {
    url: info.pageUrl,
    title: tab.title
  };
  
  if (info.selectionText) {
    data.selection = info.selectionText;
  }
  
  saveToDashboard(data);
});

async function saveToDashboard(data) {
  try {
    // Get user ID from storage
    const { userId } = await chrome.storage.local.get(['userId']);
    
    if (!userId) {
      throw new Error('Please configure your user ID in extension settings');
    }

    const response = await fetch(`${API_BASE_URL}/chrome-extension/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': userId
      },
      body: JSON.stringify(data)
    });
    
    let responseData;
    const responseText = await response.text();
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', responseText);
      throw new Error(`Server error: ${response.status} - ${responseText}`);
    }
    
    if (!response.ok) {
      console.error('API Error:', responseData);
      throw new Error(responseData.error || 'Failed to save to dashboard');
    }
    
    return responseData;
  } catch (error) {
    console.error('Error saving to dashboard:', error);
    throw error;
  }
}