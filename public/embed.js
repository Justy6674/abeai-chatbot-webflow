// AbeAI Chatbot - Complete Implementation with Cloudflare Proxy
console.log("🟢 AbeAI Chatbot initializing");

// Configuration
const CONFIG = {
  // Cloudflare Worker proxy URL
  proxyUrl: "https://abeai-proxy.downscaleweightloss.workers.dev",
  supabaseUrl: "https://ekfpageqwbwvwbcoudig.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheG55aXN4cnZkZXRjcWFmdGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MDgyMzIsImV4cCI6MjA1ODM4NDIzMn0.Nk9n9dkYEwIfY-LgAblzcVcRqyylsvTIh6p_Rh1eNW0",
  
  // Branding and Design Configuration
  logoUrl: "/abeailogo.png",
  colors: {
    primary: "#5271ff",   // Blue
    secondary: "#b68a71", // Brown
    background: "#f7f2d3", // Cream
    text: "#666d70",       // Gray
    darkText: "#333333"   // Dark text for readability
  },
  
  // Subscription Tiers
  subscriptionTiers: ["PAYG", "Essentials", "Premium", "Clinical"]
};

// User Identification and Tracking
const getUserId = () => {
  let userId = localStorage.getItem("abeai_user_id");
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("abeai_user_id", userId);
  }
  return userId;
};

// Monetization Triggers
const MONETIZATION_TRIGGERS = {
  metrics: {
    keywords: ["bmi", "body fat", "calories", "tdee", "waist", "weight", "measurements"],
    category: "metrics",
    freeSuggestion: "Basic metrics analysis available. Detailed tracking requires Essentials or Premium subscription.",
    tier: ["PAYG", "Essentials", "Premium"]
  },
  nutrition: {
    keywords: ["snack", "meal", "protein", "high-protein", "recipe", "diet", "food", "nutrition", "eat"],
    category: "nutrition",
    freeSuggestion: "Basic nutrition guidance provided. Personalized meal plans available in Essentials and Premium tiers.",
    tier: ["Essentials", "Premium"]
  },
  // ... (rest of your existing triggers)
};

// Fallback Responses
const FALLBACK_RESPONSES = {
  welcome: "Welcome to AbeAI! I'm your personal health coach. How can I help you today?",
  generic: "I'm here to support your health journey. Ask me about nutrition, fitness, or wellness.",
  // ... (other fallback responses)
};

// Message Sending Function
async function sendMessage(userMessage, additionalData = {}) {
  try {
    // Show loading indicator
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
    
    // Detect triggers and current subscription tier
    const userSubscriptionTier = localStorage.getItem("abeai_tier") || "PAYG";
    const triggerInfo = detectTriggers(userMessage);
    
    // Prepare message payload
    const messagePayload = {
      message: userMessage,
      user_id: getUserId(),
      subscription_tier: userSubscriptionTier,
      trigger: triggerInfo ? triggerInfo.category : null,
      ...additionalData
    };
    
    // Send message through Cloudflare proxy
    const response = await fetch(CONFIG.proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(messagePayload)
    });
    
    // Remove loading indicator
    loadingMessage.remove();
    
    // Process response
    if (!response.ok) {
      throw new Error("Proxy request failed");
    }
    
    const responseData = await response.json();
    
    // Create bot message element
    const botMessage = document.createElement("div");
    botMessage.className = "abeai-message abeai-bot";
    botMessage.innerHTML = `
      <img src="${CONFIG.logoUrl}" class="abeai-avatar" alt="AbeAI Logo" />
      <div class="abeai-message-content">${responseData.response || "I encountered an issue processing your request."}</div>
    `;
    
    chatMessages.appendChild(botMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Check for upgrade suggestion
    if (triggerInfo && !hasAccessToFeature(triggerInfo, userSubscriptionTier)) {
      const upgradeButton = document.createElement("button");
      upgradeButton.className = "abeai-upgrade-btn";
      upgradeButton.textContent = "Upgrade Subscription";
      upgradeButton.onclick = () => {
        window.open("https://www.downscaleai.com/products", "_blank");
      };
      chatMessages.appendChild(upgradeButton);
    }
    
    return responseData.response;
  } catch (error) {
    console.error("Message sending error:", error);
    
    // Fallback response
    const fallbackMessage = FALLBACK_RESPONSES[triggerInfo?.category] || FALLBACK_RESPONSES.generic;
    
    const errorMessage = document.createElement("div");
    errorMessage.className = "abeai-message abeai-bot";
    errorMessage.innerHTML = `
      <img src="${CONFIG.logoUrl}" class="abeai-avatar" alt="AbeAI Logo" />
      <div class="abeai-message-content">${fallbackMessage}</div>
    `;
    
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.appendChild(errorMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return fallbackMessage;
  }
}

// Trigger Detection Function
function detectTriggers(message) {
  const lowerMessage = message.toLowerCase();
  
  for (const [key, triggerInfo] of Object.entries(MONETIZATION_TRIGGERS)) {
    for (const keyword of triggerInfo.keywords) {
      if (lowerMessage.includes(keyword)) {
        return triggerInfo;
      }
    }
  }
  
  return null;
}

// Feature Access Check
function hasAccessToFeature(triggerInfo, userTier) {
  return triggerInfo.tier.includes(userTier);
}

// Create Chatbot UI
function createChatbotUI() {
  const chatbotContainer = document.createElement("div");
  chatbotContainer.id = "abeai-container";
  
  // Detailed UI HTML with improved styling
  chatbotContainer.innerHTML = `
    <div id="chat-container" class="abeai-chatbox">
      <div id="chat-header" class="abeai-header">
        <div class="abeai-brand">
          <img src="${CONFIG.logoUrl}" class="abeai-logo" alt="AbeAI Logo" />
          <span class="abeai-title">AbeAI Health Coach</span>
        </div>
        <div id="chat-toggle" class="abeai-toggle">−</div>
      </div>
      
      <div id="chat-messages" class="abeai-messages"></div>
      
      <div id="chat-input-area" class="abeai-input-area">
        <input type="text" id="chat-input" class="abeai-input" 
               placeholder="Ask AbeAI a health question..." />
        <button id="send-btn" class="abeai-send-btn">Send</button>
      </div>
    </div>
    
    <div id="chat-minimized" class="abeai-minimized">
      <div class="abeai-bubble">
        <img src="${CONFIG.logoUrl}" class="abeai-bubble-logo" alt="AbeAI" />
      </div>
    </div>
  `;
  
  // Add styles
  const styleTag = document.createElement("style");
  styleTag.textContent = `
    /* Comprehensive chatbot styling */
    #abeai-container {
      --primary: ${CONFIG.colors.primary};
      --secondary: ${CONFIG.colors.secondary};
      --background: ${CONFIG.colors.background};
      --text: ${CONFIG.colors.text};
      font-family: 'Arial', sans-serif;
      z-index: 9999;
    }
    
    .abeai-chatbox {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 350px;
      max-height: 80vh;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
    }
    
    .abeai-messages {
      flex-grow: 1;
      overflow-y: auto;
      padding: 15px;
      background: var(--background);
    }
    
    .abeai-input-area {
      display: flex;
      padding: 10px;
      background: white;
      border-top: 1px solid #eee;
    }
    
    .abeai-input {
      flex-grow: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
    }
    
    .abeai-send-btn {
      background: var(--primary);
      color: white;
      border: none;
      padding: 10px 15px;
      margin-left: 10px;
      border-radius: 6px;
    }
    
    .abeai-minimized {
      position: fixed;
      bottom: 20px;
      right: 20px;
      cursor: pointer;
    }
    
    .abeai-bubble {
      width: 60px;
      height: 60px;
      background: var(--secondary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
    
    .abeai-bubble-logo {
      width: 40px;
      height: 40px;
    }
  `;
  
  document.body.appendChild(chatbotContainer);
  document.head.appendChild(styleTag);
  
  // Event Listeners
  const chatContainer = document.getElementById('chat-container');
  const chatMinimized = document.getElementById('chat-minimized');
  const chatToggle = document.getElementById('chat-toggle');
  const sendBtn = document.getElementById('send-btn');
  const chatInput = document.getElementById('chat-input');
  
  // Toggle functionality
  chatToggle.onclick = () => {
    chatContainer.style.display = chatContainer.style.display === 'none' ? 'flex' : 'none';
    chatMinimized.style.display = chatMinimized.style.display === 'none' ? 'block' : 'none';
  };
  
  chatMinimized.onclick = () => {
    chatContainer.style.display = 'flex';
    chatMinimized.style.display = 'none';
  };
  
  // Send message handlers
  sendBtn.onclick = () => handleMessageSend();
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleMessageSend();
  });
  
  function handleMessageSend() {
    const userMessage = chatInput.value.trim();
    if (userMessage) {
      // Create user message in chat
      const userMessageElement = document.createElement("div");
      userMessageElement.className = "abeai-message abeai-user";
      userMessageElement.innerHTML = `
        <div class="abeai-message-content">${userMessage}</div>
      `;
      
      const chatMessages = document.getElementById('chat-messages');
      chatMessages.appendChild(userMessageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // Send message
      sendMessage(userMessage);
      
      // Clear input
      chatInput.value = '';
    }
  }
  
  // Send welcome message
  setTimeout(() => {
    sendMessage("welcome");
  }, 1000);
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", createChatbotUI);
