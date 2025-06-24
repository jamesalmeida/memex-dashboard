document.addEventListener('DOMContentLoaded', function() {
  const savePageBtn = document.getElementById('save-page');
  const saveSelectionBtn = document.getElementById('save-selection');
  const statusMessage = document.getElementById('status-message');

  savePageBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      chrome.runtime.sendMessage({
        action: 'savePage',
        data: {
          url: tab.url,
          title: tab.title
        }
      }, (response) => {
        showStatus(response.success ? 'Page saved!' : 'Error saving page', response.success);
      });
    } catch (error) {
      showStatus('Error: ' + error.message, false);
    }
  });

  saveSelectionBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      chrome.tabs.sendMessage(tab.id, { action: 'getSelection' }, (response) => {
        if (response && response.selection) {
          chrome.runtime.sendMessage({
            action: 'saveSelection',
            data: {
              url: tab.url,
              title: tab.title,
              selection: response.selection
            }
          }, (saveResponse) => {
            showStatus(saveResponse.success ? 'Selection saved!' : 'Error saving selection', saveResponse.success);
          });
        } else {
          showStatus('No text selected', false);
        }
      });
    } catch (error) {
      showStatus('Error: ' + error.message, false);
    }
  });

  function showStatus(message, isSuccess) {
    statusMessage.textContent = message;
    statusMessage.className = isSuccess ? 'success' : 'error';
    setTimeout(() => {
      statusMessage.className = '';
      statusMessage.textContent = '';
    }, 3000);
  }
});