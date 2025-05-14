const RULESET_ID = "ruleset_twitch_chat";

async function updateRules(isChatBlocked) {
  if (isChatBlocked) {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: [RULESET_ID]
    });
    console.log("Rusel blocked enable");
    chrome.action.setIcon({
      path: {
        "16": "images/icon16_disabled.png",
        "48": "images/icon48_disabled.png",
        "128": "images/icon128_disabled.png"
      }
    });
  } else {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      disableRulesetIds: [RULESET_ID]
    });
    console.log("Rules blocked disable");
    chrome.action.setIcon({
      path: {
        "16": "images/icon16_enabled.png",
        "48": "images/icon48_enabled.png",
        "128": "images/icon128_enabled.png"
      }
    });
  }
}

chrome.runtime.onInstalled.addListener(async (details) => {
  // Установим начальное состояние: чат по умолчанию заблокирован
  // Если хотите, чтобы по умолчанию был разрешен, установите isChatBlocked: false
  await chrome.storage.local.get(['isChatBlocked'], async (result) => {
    let initialState = result.isChatBlocked;
    if (typeof initialState === 'undefined') {
      initialState = true; // По умолчанию блокируем чат
      await chrome.storage.local.set({ isChatBlocked: initialState });
    }
    await updateRules(initialState);
    console.log("Beta", initialState);
  });
});

// Слушаем сообщения от popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleChatBlocking") {
    updateRules(message.isChatBlocked);
    // Не обязательно отправлять ответ, так как popup уже обновил свой UI
    // и состояние сохранено в chrome.storage.local
    return true; // Для асинхронного ответа, если он понадобится
  }
});

// Также обновим правила при запуске браузера, на случай если состояние изменилось
// пока браузер был закрыт.
chrome.runtime.onStartup.addListener(async () => {
    await chrome.storage.local.get(['isChatBlocked'], async (result) => {
        if (typeof result.isChatBlocked !== 'undefined') {
            await updateRules(result.isChatBlocked);
            console.log("Alfa:", result.isChatBlocked);
        } else {
            // Если состояние не установлено, инициализируем (аналогично onInstalled)
            const initialState = true; // По умолчанию блокируем
            await chrome.storage.local.set({ isChatBlocked: initialState });
            await updateRules(initialState);
            console.log("TOmega", initialState);
        }
    });
});