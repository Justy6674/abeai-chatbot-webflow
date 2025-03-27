// AbeAI Chatbot - Full Embed Script with Working Logo and Cloudflare Proxy
console.log("🟢 AbeAI Chatbot initializing");

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
if (!localStorage.getItem("abeai_user_id")) {
  localStorage.setItem("abeai_user_id", userId);
}

let userSubscriptionTier = localStorage.getItem("abeai_tier") || "PAYG";

async function sendMessage(userMessage) {
  try {
    const loadingMessage = document.createElement("div");
    loadingMessage.className = "abeai-message loading";
    loadingMessage.innerHTML = `
      <img src="${CONFIG.logoUrl}" class="abeai-avatar" alt="AbeAI Logo" />
      <div class="abeai-typing-indicator">
        <span></span><span></span><span></span>
      </div>
    `;
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.appendChild(loadingMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const response = await fetch(CONFIG.proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMessage,
        user_id: userId,
        subscription_tier: userSubscriptionTier
      }),
    });

    const data = await response.json();
    loadingMessage.remove();

    const botMessage = document.createElement("div");
    botMessage.className = "abeai-message abeai-bot";
    botMessage.innerHTML = `
      <img src="${CONFIG.logoUrl}" class="abeai-avatar" alt="AbeAI Logo" />
      <div class="abeai-message-content">${data.response || "Sorry, I couldn’t process your request."}</div>
    `;
    chatMessages.appendChild(botMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (data.upgrade_suggested) {
      const upgradeButton = document.createElement("button");
      upgradeButton.className = "abeai-upgrade-btn";
      upgradeButton.textContent = "Explore Subscription Options";
      upgradeButton.onclick = () => {
        window.open("https://www.downscaleai.com/products", "_blank");
      };
      chatMessages.appendChild(upgradeButton);
    }
  } catch (error) {
    console.error("Error:", error);
    const existingLoading = document.querySelector(".abeai-message.loading");
    if (existingLoading) existingLoading.remove();

    const chatMessages = document.getElementById('chat-messages');
    const errorMessage = document.createElement("div");
    errorMessage.className = "abeai-message abeai-bot";
    errorMessage.innerHTML = `
      <img src="${CONFIG.logoUrl}" class="abeai-avatar" alt="AbeAI Logo" />
      <div class="abeai-message-content">I’m having trouble connecting right now. Please try again later.</div>
    `;
    chatMessages.appendChild(errorMessage);
  }
}

function createChatbotUI() {
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
      <div id="predefined-selections" class="abeai-quick-options">
        <button onclick="sendMessage('Can you analyse my BMI?')">Can you analyse my BMI?</button>
        <button onclick="sendMessage('Give me 20 high-protein snack ideas')">20 High-Protein Snacks</button>
      </div>
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
  document.body.appendChild(chatbotContainer);

  const chatToggle = document.getElementById("chat-toggle");
  const chatMinimized = document.getElementById("chat-minimized");
  const chatBox = document.getElementById("chat-container");
  const sendBtn = document.getElementById("send-btn");
  const chatInput = document.getElementById("chat-input");

  chatToggle.onclick = () => {
    chatBox.style.display = "none";
    chatMinimized.style.display = "flex";
  };

  chatMinimized.onclick = () => {
    chatBox.style.display = "flex";
    chatMinimized.style.display = "none";
  };

  sendBtn.onclick = () => {
    const userMessage = chatInput.value.trim();
    if (userMessage) {
      const chatMessages = document.getElementById("chat-messages");
      const userMsgElement = document.createElement("div");
      userMsgElement.className = "abeai-message abeai-user";
      userMsgElement.innerHTML = `<div class="abeai-message-content">${userMessage}</div>`;
      chatMessages.appendChild(userMsgElement);
      chatInput.value = "";
      sendMessage(userMessage);
    }
  };

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
  });
}

document.addEventListener("DOMContentLoaded", function() {
  createChatbotUI();
});
