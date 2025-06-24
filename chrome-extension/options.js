document.addEventListener('DOMContentLoaded', function() {
  const userIdInput = document.getElementById('userId');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');

  // Load saved user ID
  chrome.storage.local.get(['userId'], function(result) {
    if (result.userId) {
      userIdInput.value = result.userId;
    }
  });

  saveBtn.addEventListener('click', function() {
    const userId = userIdInput.value.trim();
    
    if (!userId) {
      showStatus('Please enter a user ID', false);
      return;
    }

    chrome.storage.local.set({ userId: userId }, function() {
      showStatus('Settings saved successfully!', true);
    });
  });

  function showStatus(message, isSuccess) {
    status.textContent = message;
    status.className = isSuccess ? 'success' : 'error';
    setTimeout(() => {
      status.className = '';
      status.textContent = '';
    }, 3000);
  }
});