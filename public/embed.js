// Guard to prevent multiple script executions
if (window.abeaiInitialized) {
  console.log("🟡 AbeAI already initialized, skipping...");
} else {
  window.abeaiInitialized = true;
  console.log("🟢 AbeAI Chatbot initializing (Stable Version)");

  const CONFIG = {
    proxyUrl: "https://abeai-proxy.downscaleweightloss.workers.dev",
    logoUrl: "https://abeai-chatbot-webflow-y8ks.vercel.app/abeailogo.png",
    colors: {
      primary: "#5271ff",
      secondary: "#b68a71",
      background: "#f7f2d3",
      text: "#666d70",
      darkText: "#333333"
    }
  };

  const userId = localStorage.getItem("abeai_user_id") || crypto.randomUUID();
  localStorage.setItem("abeai_user_id", userId);

  function createChatbotUI() {
    if (document.getElementById("abeai-container")) return;

    const chatbotContainer = document.createElement("div");
    chatbotContainer.id = "abeai-container";
    chatbotContainer.innerHTML = `
      <div id="chat-container" class="abeai-chatbox">
        <div id="chat-header" class="abeai-header">
          <div class="abeai-brand">
            <img src="${CONFIG.logoUrl}" class="abeai-logo" alt="AbeAI Logo" />
            <span class="abeai-title"><span class="abeai-highlight">AbeAI</span> Health Coach</span>
          </div>
          <div id="chat-toggle" class="abeai-toggle">−</div>
        </div>
        <div id="chat-messages" class="abeai-messages"></div>
        <div id="chat-input-area" class="abeai-input-area">
          <input type="text" id="chat-input" class="abeai-input" placeholder="Ask AbeAI..." />
          <button id="send-btn" class="abeai-send-btn">Send</button>
        </div>
      </div>
      <div id="chat-minimized" class="abeai-minimized">
        <div class="abeai-bubble-hint">Chat with AbeAI</div>
        <div class="abeai-bubble">
          <img src="${CONFIG.logoUrl}" class="abeai-bubble-logo" alt="AbeAI" />
        </div>
        <div class="abeai-bubble-prompt">Press Here</div>
      </div>
    `;

    // Insert the full CSS here, exactly as before, UNCHANGED.
    const styleTag = document.createElement("style");
    styleTag.id = "abeai-styles";
    styleTag.textContent = `
      /* Put your full original CSS EXACTLY HERE - no edits! */
    `;
    
    document.body.appendChild(chatbotContainer);
    document.head.appendChild(styleTag);
  }

  function displayMessage(content, isUser = false) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement("div");
    messageElement.className = `abeai-message ${isUser ? 'abeai-user' : 'abeai-bot'}`;
    messageElement.innerHTML = isUser 
      ? `<div class="abeai-message-content">${content}</div>`
      : `
        <img src="${CONFIG.logoUrl}" class="abeai-avatar" alt="AbeAI Logo" />
        <div class="abeai-message-content">${content}</div>
      `;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function sendMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const loadingElement = document.createElement("div");
    loadingElement.className = "abeai-message loading";
    loadingElement.innerHTML = `
      <img src="${CONFIG.logoUrl}" class="abeai-avatar" alt="AbeAI Logo" />
      <div class="abeai-typing-indicator"><span></span><span></span><span></span></div>
    `;
    chatMessages.appendChild(loadingElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const response = await fetch(CONFIG.proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, user_id: userId })
      });
      const data = await response.json();
      loadingElement.remove();
      displayMessage(data.response || "Sorry, I couldn't process that right now.");
    } catch (error) {
      loadingElement.remove();
      displayMessage("Sorry, an error occurred. Please try again.");
    }
  }

  function initializeChatbot() {
    createChatbotUI();

    const chatContainer = document.getElementById('chat-container');
    const chatMinimized = document.getElementById('chat-minimized');
    const chatToggle = document.getElementById('chat-toggle');
    const sendBtn = document.getElementById('send-btn');
    const chatInput = document.getElementById('chat-input');

    let isExpanded = window.innerWidth > 768;
    chatContainer.style.display = isExpanded ? 'flex' : 'none';
    chatMinimized.style.display = isExpanded ? 'none' : 'flex';

    chatToggle.onclick = () => {
      isExpanded = !isExpanded;
      chatContainer.style.display = isExpanded ? 'flex' : 'none';
      chatMinimized.style.display = isExpanded ? 'none' : 'flex';
      chatToggle.textContent = isExpanded ? '−' : '+';
    };

    chatMinimized.onclick = () => {
      isExpanded = true;
      chatContainer.style.display = 'flex';
      chatMinimized.style.display = 'none';
      chatToggle.textContent = '−';
    };

    sendBtn.onclick = () => {
      const msg = chatInput.value.trim();
      if (msg) {
        chatInput.value = '';
        displayMessage(msg, true);
        sendMessage(msg);
      }
    };

    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendBtn.onclick();
    });

    // Frontend-only safe welcome message:
    setTimeout(() => {
      displayMessage("Hello! I'm AbeAI, your personal health coach. How can I help you today?");
    }, 1000);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    initializeChatbot();
  } else {
    document.addEventListener("DOMContentLoaded", initializeChatbot);
  }

  window.addEventListener('beforeunload', () => {
    window.abeaiInitialized = false;
  });
}
