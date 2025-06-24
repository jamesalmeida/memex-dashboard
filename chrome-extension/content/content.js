chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelection') {
    const selection = window.getSelection().toString();
    sendResponse({ selection: selection });
  }
  return true;
});