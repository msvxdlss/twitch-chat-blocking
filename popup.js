const toggleButton = document.getElementById('toggleButton');
const statusText = document.getElementById('statusText');

// Функция для обновления UI (текст кнопки и статус)
function updateUI(isChatBlocked) {
  if (isChatBlocked) {
    statusText.textContent = 'Chat bloced';
    toggleButton.textContent = 'Enable chat';
    chrome.action.setIcon({
      path: {
        "16": "images/icon16_disabled.png",
        "48": "images/icon48_disabled.png",
        "128": "images/icon128_disabled.png"
      }
    });
  } else {
    statusText.textContent = 'Chat is Enable';
    toggleButton.textContent = 'Blocked chat';
    chrome.action.setIcon({
      path: {
        "16": "images/icon16_enabled.png",
        "48": "images/icon48_enabled.png",
        "128": "images/icon128_enabled.png"
      }
    });
  }
}

// Загружаем текущее состояние при открытии popup
chrome.storage.local.get(['isChatBlocked'], (result) => {
  updateUI(result.isChatBlocked);
});

// Слушатель для кнопки
toggleButton.addEventListener('click', () => {
  chrome.storage.local.get(['isChatBlocked'], (result) => {
    const newBlockedState = !result.isChatBlocked;
    chrome.storage.local.set({ isChatBlocked: newBlockedState }, () => {
      updateUI(newBlockedState);
      // Отправляем сообщение в background.js для обновления правил
      chrome.runtime.sendMessage({
        action: "toggleChatBlocking",
        isChatBlocked: newBlockedState
      });
    });
  });
});

// Обновляем UI, если состояние изменилось в другом месте (например, background.js инициализировал)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.isChatBlocked) {
    updateUI(changes.isChatBlocked.newValue);
  }
});