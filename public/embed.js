// AbeAI Chatbot - Complete Implementation with Monetization Triggers
// This version uses Cloudflare Workers as a reliable proxy and includes all monetization triggers
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
        <div id="predefined-options" class="abeai-options-grid"></div>
      </div>
      <div id="chat-input-area" class="abeai-input-area">
        <input type="text" id="chat-input" class="abeai-input" placeholder="Ask AbeAI or select..." />
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

  chatToggle.onclick = () => {
    chatBox.style.display = "none";
    chatMinimized.style.display = "flex";
  };

  chatMinimized.onclick = () => {
    chatBox.style.display = "flex";
    chatMinimized.style.display = "none";
  };
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("🟢 DOM loaded, initializing AbeAI");

  if (typeof createChatbotUI === "function") {
    createChatbotUI();
  } else {
    console.error("❌ createChatbotUI is not defined");
  }

  const chatInput = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");
  const chatMessages = document.getElementById("chat-messages");

  sendBtn.onclick = async () => {
    const userMessage = chatInput.value.trim();
    if (userMessage) {
      chatInput.value = "";
      const userMessageElement = document.createElement("div");
      userMessageElement.className = "abeai-message abeai-user";
      userMessageElement.innerHTML = `<div class="abeai-message-content">${userMessage}</div>`;
      chatMessages.appendChild(userMessageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      document.getElementById("predefined-selections").style.display = "none";
      await sendMessage(userMessage);
    }
  };

  chatInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      sendBtn.click();
    }
  });

  setTimeout(async () => {
    await sendMessage("welcome");
  }, 1000);
});
