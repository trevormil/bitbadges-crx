chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SET_INFO') {
    chrome.runtime.sendMessage({ type: 'SET_INFO', data: message.data })
    chrome.storage.sync.set({ info: message.data })
  }
})

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.type === 'SET_SETTINGS') {
    chrome.storage.sync.set({ settings: message.data })
  }
})

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.type === 'LOAD_SETTINGS') {
    chrome.storage.sync.get('settings', (data) => {
      sendResponse({ type: 'FROM_PAGE', text: data })
    })
  }
})
