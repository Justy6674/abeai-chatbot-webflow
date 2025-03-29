// Guard to prevent multiple script executions
if (window.abeaiInitialized) {
  console.log("🟡 AbeAI already initialized, skipping... (Script source: ", document.currentScript ? document.currentScript.src : "inline script", ")");
} else {
  window.abeaiInitialized = true;

  console.log("🟢 AbeAI Chatbot initializing (Version: 1.1.1, Script source: ", document.currentScript ? document.currentScript.src : "inline script", ")");

  // Configuration (updated with correct URLs)
  const CONFIG = {
    proxyUrl: "https://abeai-proxy.downscaleweightloss.workers.dev", // Correct URL as provided
    logoUrl: "https://abeai-chatbot-webflow-y8ks.vercel.app/abeailogo.png", // Correct URL as provided
    colors: {
      primary: "#5271ff",
      secondary: "#b68a71",
      background: "#f7f2d3",
      text: "#666d70",
      darkText: "#333333"
    }
  };

  // User ID management (minimal local storage for ID only)
  const userId = localStorage.getItem("abeai_user_id") || crypto.randomUUID();
  if (!localStorage.getItem("abeai_user_id")) {
    localStorage.setItem("abeai_user_id", userId);
  }

  // Create chatbot UI (preserving original format)
  function createChatbotUI() {
    if (document.getElementById("abeai-container")) {
      console.log("🟡 AbeAI container already exists, skipping UI creation...");
      return;
    }

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

    const styleTag = document.createElement("style");
    styleTag.id = "abeai-styles";
    styleTag.textContent = `
      #abeai-container {
        font-family: 'Open Sans', 'Helvetica Neue', sans-serif;
        --primary: ${CONFIG.colors.primary};
        --secondary: ${CONFIG.colors.secondary};
        --background: ${CONFIG.colors.background};
        --text: ${CONFIG.colors.text};
        --dark-text: ${CONFIG.colors.darkText};
        --shadow: rgba(0, 0, 0, 0.2);
        --transition: all 0.3s ease-in-out;
        --border-radius: 12px;
        font-size: 16px;
        line-height: 1.5;
        z-index: 99999;
      }
      .abeai-chatbox {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 400px;
        max-height: 80vh;
        max-width: calc(100vw - 40px);
        background: #ffffff;
        box-shadow: 0 8px 20px var(--shadow);
        border-radius: var(--border-radius);
        display: flex;
        flex-direction: column;
        z-index: 9999;
        transition: var(--transition);
        overflow: hidden;
      }
      @media (max-width: 768px) {
        .abeai-chatbox { 
          top: 0;
          bottom: 0;
          right: 0;
          width: 100vw;
          height: 100vh;
          max-height: none;
          border-radius: 0;
        }
      }
      .abeai-header {
        background: var(--background);
        color: var(--text);
        padding: 16px;
        font-weight: bold;
        font-size: 17px;
        border-radius: var(--border-radius) var(--border-radius) 0 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--secondary);
      }
      @media (max-width: 768px) {
        .abeai-header {
          border-radius: 0;
          padding: 12px;
        }
      }
      .abeai-brand { display: flex; align-items: center; }
      .abeai-logo { width: 30px; height: 30px; margin-right: 10px; }
      .abeai-highlight { color: var(--primary); font-weight: 700; }
      .abeai-toggle { cursor: pointer; font-size: 20px; color: var(--text); width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; }
      .abeai-messages { 
        flex-grow: 1; 
        overflow-y: auto; 
        padding: 16px; 
        font-size: 16px; 
        height: 400px;
        scroll-behavior: smooth; 
        background: #fafafa; 
      }
      @media (max-width: 768px) {
        .abeai-messages { 
          height: auto;
          flex-grow: 1;
          padding: 12px;
        }
      }
      .abeai-message { margin-bottom: 16px; display: flex; align-items: flex-start; }
      .abeai-avatar { width: 36px; height: 36px; margin-right: 12px; border-radius: 50%; border: 2px solid var(--background); box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
      .abeai-message-content { background: var(--background); color: var(--dark-text); border-radius: 12px; padding: 16px; max-width: 80%; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border: 1px solid var(--secondary); font-weight: 500; }
      .abeai-message.abeai-user { flex-direction: row-reverse; }
      .abeai-message.abeai-user .abeai-message-content { background: var(--primary); color: white; border: none; }
      .abeai-upgrade-btn { background: var(--secondary); color: white; border: none; border-radius: 8px; padding: 12px 16px; margin: 12px auto; display: block; cursor: pointer; font-weight: 600; transition: var(--transition); box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
      .abeai-upgrade-btn:hover { background: #a07965; transform: translateY(-2px); }
      .abeai-typing-indicator { background: var(--background); border-radius: 12px; padding: 16px; display: flex; align-items: center; border: 1px solid var(--secondary); }
      .abeai-typing-indicator span { width: 8px; height: 8px; background: var(--secondary); border-radius: 50%; display: inline-block; margin: 0 2px; opacity: 0.7; animation: typing 1s infinite ease-in-out; }
      .abeai-typing-indicator span:nth-child(1) { animation-delay: 0s; }
      .abeai-typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
      .abeai-typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes typing { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      .abeai-quick-options { 
        padding: 12px; 
        background: var(--background); 
        display: block; 
        border-top: 1px solid var(--secondary); 
        max-height: 150px; 
        overflow-y: auto; 
        scrollbar-width: thin; 
        scrollbar-color: var(--secondary) var(--background); 
      }
      .abeai-quick-options::-webkit-scrollbar {
        width: 8px;
      }
      .abeai-quick-options::-webkit-scrollbar-track {
        background: var(--background);
      }
      .abeai-quick-options::-webkit-scrollbar-thumb {
        background: var(--secondary);
        border-radius: 4px;
      }
      .abeai-options-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
      .abeai-options-grid button { display: block; width: 100%; text-align: left; padding: 12px 16px; background: var(--secondary); color: white; border-radius: 6px; font-size: 14px; font-weight: 500; border: none; cursor: pointer; transition: var(--transition); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .abeai-options-grid button:hover { background: #a07965; transform: translateY(-2px); }
      .abeai-input-area { display: flex; padding: 12px 16px; border-top: 2px solid var(--primary); background: white; }
      .abeai-input { flex-grow: 1; border: 1px solid #ccc; padding: 12px; border-radius: 6px; font-family: inherit; font-size: 16px; color: #333333 !important; }
      .abeai-input::placeholder { color: #666d70; opacity: 0.7; }
      .abeai-send-btn { background-color: var(--secondary); color: white; padding: 12px 16px; margin-left: 8px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; transition: var(--transition); }
      .abeai-send-btn:hover { background: #a07965; transform: translateY(-2px); }
      .abeai-minimized { 
        position: fixed; 
        bottom: 30px; 
        right: 30px; 
        z-index: 9999; 
        cursor: pointer; 
        display: none; 
        flex-direction: column; 
        align-items: center; 
        gap: 8px; 
        text-align: center; 
      }
      .abeai-bubble-hint { 
        background: var(--primary); 
        color: white; 
        padding: 10px 16px; 
        border-radius: 6px; 
        font-size: 15px; 
        font-weight: 600; 
        width: max-content; 
        text-align: center; 
        box-shadow: 0 2px 5px rgba(0,0,0,0.2); 
        animation: magnify 2s infinite ease-in-out; 
      }
      .abeai-bubble { 
        width: 64px; 
        height: 64px; 
        background: var(--background); 
        border-radius: 50%; 
        box-shadow: 0 4px 10px var(--shadow); 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        border: 2px solid var(--secondary); 
        animation: magnify 2s infinite ease-in-out; 
      }
      .abeai-bubble-prompt { 
        background: var(--primary); 
        color: white; 
        padding: 10px 16px; 
        border-radius: 6px; 
        font-size: 15px; 
        font-weight: 600; 
        width: max-content; 
        text-align: center; 
        box-shadow: 0 2px 5px rgba(0,0,0,0.2); 
        animation: magnify 2s infinite ease-in-out; 
      }
      @keyframes magnify {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      .abeai-bubble-logo { width: 40px; height: 40px; }
      @media (max-width: 480px) { 
        .abeai-minimized { 
          bottom: 20px; 
          right: 20px; 
        } 
      }
    `;

    const existingStyles = document.getElementById("abeai-styles");
    if (existingStyles) existingStyles.remove();

    document.body.appendChild(chatbotContainer);
    document.head.appendChild(styleTag);
  }

  // Display message (user or bot)
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

  // Show loading indicator
  function showLoading() {
    const chatMessages = document.getElementById('chat-messages');
    const loadingElement = document.createElement("div");
    loadingElement.className = "abeai-message loading";
    loadingElement.innerHTML = `
      <img src="${CONFIG.logoUrl}" class="abeai-avatar" alt="AbeAI Logo" />
      <div class="abeai-typing-indicator"><span></span><span></span><span></span></div>
    `;
    chatMessages.appendChild(loadingElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return loadingElement;
  }

  // Send message to backend
  async function sendMessage(message) {
    const loadingElement = showLoading();
    
    try {
      const response = await fetch(CONFIG.proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          user_id: userId
        })
      });

      if (!response.ok) throw new Error(await response.text());
      
      const data = await response.json();
      loadingElement.remove();
      
      if (data.error) throw new Error(data.error);
      
      displayMessage(data.response);
      if (data.upgrade_suggested) {
        const upgradeButton = document.createElement("button");
        upgradeButton.className = "abeai-upgrade-btn";
        upgradeButton.innerHTML = "Explore Subscription Options";
        upgradeButton.onclick = () => window.open("https://www.downscale.com.au", "_blank");
        document.getElementById('chat-messages').appendChild(upgradeButton);
      }
      
    } catch (error) {
      loadingElement.remove();
      displayMessage("Sorry, I couldn't process that right now. Please try again.");
      console.error("Error:", error);
    }
  }

  // Initialize chatbot with all original UI elements
  function initializeChatbot() {
    createChatbotUI();

    const chatContainer = document.getElementById('chat-container');
    const chatMinimized = document.getElementById('chat-minimized');
    const chatToggle = document.getElementById('chat-toggle');
    const predefinedSelections = document.getElementById('predefined-selections');
    const predefinedOptions = document.getElementById('predefined-options');
    const chatMessages = document.getElementById('chat-messages');
    const sendBtn = document.getElementById('send-btn');
    const chatInput = document.getElementById('chat-input');

    if (!chatContainer || !chatMinimized || !chatToggle || !predefinedSelections || !predefinedOptions || !chatMessages || !sendBtn || !chatInput) {
      console.error("🔥 Required DOM elements not found");
      return;
    }

    const isMobile = window.innerWidth <= 768;
    let isExpanded = !isMobile;
    let presetsUsed = false;
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

    const predefinedMessages = [
      "Can you analyse my BMI?",
      "How many calories should I eat daily to lose weight?",
      "Give me 20 high-protein snack ideas",
      "Create a kid-friendly lunchbox meal plan",
      "Suggest a simple home workout routine"
    ];

    predefinedMessages.forEach((msg) => {
      const button = document.createElement("button");
      button.textContent = msg;
      button.onclick = async () => {
        if (!presetsUsed) {
          predefinedSelections.style.display = 'none';
          presetsUsed = true;
        }
        displayMessage(msg, true);
        await sendMessage(msg);
      };
      predefinedOptions.appendChild(button);
    });

    const handleSubmit = async () => {
      const message = chatInput.value.trim();
      if (!message) return;
      
      chatInput.value = '';
      displayMessage(message, true);
      if (!presetsUsed) {
        predefinedSelections.style.display = 'none';
        presetsUsed = true;
      }
      await sendMessage(message);
    };

    sendBtn.onclick = handleSubmit;
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSubmit();
    });

    setTimeout(() => {
      if (document.getElementById("chat-input")) {
        sendMessage("welcome");
      } else {
        console.warn("🟡 chat-input not ready yet");
      }
    }, 1000);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    initializeChatbot();
  } else {
    document.addEventListener("DOMContentLoaded", initializeChatbot, { once: true });
  }

  window.addEventListener('beforeunload', () => {
    console.log("🟠 Page unloading, cleaning up AbeAI...");
    window.abeaiInitialized = false;
  });
}
