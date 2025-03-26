// AbeAI Chatbot Embed Script with CORS & Mobile Fixes
// This script creates a responsive chatbot that works across devices
// and properly communicates with Supabase Edge Functions

console.log("🟢 AbeAI Chatbot initializing");

// Configuration - Update with your values
const CONFIG = {
  supabaseUrl: "https://haxnyisxrvdetcqaftdb.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheG55aXN4cnZkZXRjcWFmdGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MDgyMzIsImV4cCI6MjA1ODM4NDIzMn0.Nk9n9dkYEwIfY-LgAblzcVcRqyylsvTIh6p_Rh1eNW0",
  logoUrl: "https://abeai-chatbot-webflow-y8ks.vercel.app/abeailogo.png",
  colors: {
    primary: "#5271ff",
    secondary: "#b68a71",
    background: "#f7f2d3",
    text: "#333333"
  }
};

// Create unique user ID or retrieve existing
const userId = localStorage.getItem("abeai_user_id") || crypto.randomUUID();
if (!localStorage.getItem("abeai_user_id")) {
  localStorage.setItem("abeai_user_id", userId);
}

// Monetization tier detection - Will be replaced with actual auth check
// This should be determined by your authentication system
let userSubscriptionTier = "PAYG"; // Default to free tier
// Options: PAYG, Essentials, Premium, Clinical

// Helper function to send messages to Supabase Edge Function
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
    
    console.log(`🔄 Sending message to Edge Function with tier: ${userSubscriptionTier}`);
    
    // CORS-friendly request to Supabase Edge Function
    const response = await fetch(`${CONFIG.supabaseUrl}/functions/v1/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": CONFIG.supabaseAnonKey,
        "Authorization": `Bearer ${CONFIG.supabaseAnonKey}`,
      },
      body: JSON.stringify({
        message: userMessage,
        user_id: userId,
        subscription_tier: userSubscriptionTier,
        ...additionalData
      }),
    });
    
    // Error handling for non-200 responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Edge Function error (${response.status}):`, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Unknown error'}`);
    }
    
    // Parse response data
    const data = await response.json();
    console.log("✅ Response received:", data);
    
    if (!data || !data.response) {
      throw new Error("Invalid response format from server");
    }
    
    // Remove loading indicator
    loadingMessage.remove();
    
    // Create bot message element
    const botMessage = document.createElement("div");
    botMessage.className = "abeai-message abeai-bot";
    botMessage.innerHTML = `
      <img src="${CONFIG.logoUrl}" class="abeai-avatar" alt="AbeAI Logo" />
      <div class="abeai-message-content">${data.response}</div>
    `;
    chatMessages.appendChild(botMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Re-enable predefined selections if present
    const predefinedEl = document.getElementById('predefined-selections');
    if (predefinedEl) predefinedEl.style.display = 'block';
    
    return data.response;
  } catch (error) {
    console.error("🔥 Message processing failed:", error.message);
    
    // Remove loading indicator if it exists
    const existingLoading = document.querySelector(".abeai-message.loading");
    if (existingLoading) existingLoading.remove();
    
    // Create error message
    const chatMessages = document.getElementById('chat-messages');
    const errorMessage = document.createElement("div");
    errorMessage.className = "abeai-message abeai-bot";
    errorMessage.innerHTML = `
      <img src="${CONFIG.logoUrl}" class="abeai-avatar" alt="AbeAI Logo" />
      <div class="abeai-message-content">
        Sorry, I couldn't process your request. Please try again soon.
      </div>
    `;
    chatMessages.appendChild(errorMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Re-enable predefined selections
    const predefinedEl = document.getElementById('predefined-selections');
    if (predefinedEl) predefinedEl.style.display = 'block';
    
    return "Sorry, I couldn't process your request. Please try again soon.";
  }
}

// Create chatbot UI
function createChatbotUI() {
  // Create container for entire chatbot
  const chatbotContainer = document.createElement("div");
  chatbotContainer.id = "abeai-container";
  
  // Chatbot markup structure
  chatbotContainer.innerHTML = `
    <!-- Expanded chat interface -->
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
        <input type="text" id="chat-input" class="abeai-input" 
               placeholder="Ask AbeAI or select..." />
        <button id="send-btn" class="abeai-send-btn">Send</button>
      </div>
    </div>
    
    <!-- Minimized chat button - Perfectly centered vertical layout -->
    <div id="chat-minimized" class="abeai-minimized">
      <div class="abeai-bubble-hint">Chat with AbeAI</div>
      <div class="abeai-bubble">
        <img src="${CONFIG.logoUrl}" class="abeai-bubble-logo" alt="AbeAI" />
      </div>
      <div class="abeai-bubble-prompt">Press Here</div>
    </div>
  `;
  
  // Append styles for chatbot
  const styleTag = document.createElement("style");
  styleTag.textContent = `
    /* AbeAI Chatbot Styles */
    #abeai-container {
      font-family: 'Open Sans', 'Helvetica Neue', sans-serif;
      --primary: ${CONFIG.colors.primary};
      --secondary: ${CONFIG.colors.secondary};
      --background: ${CONFIG.colors.background};
      --text: ${CONFIG.colors.text};
      --shadow: rgba(0, 0, 0, 0.2);
      --transition: all 0.3s ease-in-out;
      --border-radius: 15px;
      font-size: 16px;
      line-height: 1.5;
    }
    
    /* Expanded chat container */
    .abeai-chatbox {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 360px;
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
    
    /* Mobile adjustments */
    @media (max-width: 768px) {
      .abeai-chatbox {
        width: calc(100vw - 40px);
        max-height: 70vh;
        bottom: 20px;
        right: 20px;
      }
    }
    
    /* Header styling */
    .abeai-header {
      background: var(--background);
      color: var(--text);
      padding: 15px;
      font-weight: bold;
      font-size: 17px;
      border-radius: var(--border-radius) var(--border-radius) 0 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    /* Brand display */
    .abeai-brand {
      display: flex;
      align-items: center;
    }
    
    .abeai-logo {
      width: 30px;
      height: 30px;
      margin-right: 10px;
    }
    
    .abeai-highlight {
      color: var(--primary);
    }
    
    /* Toggle button */
    .abeai-toggle {
      cursor: pointer;
      font-size: 20px;
      color: var(--text);
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* Messages area */
    .abeai-messages {
      flex-grow: 1;
      overflow-y: auto;
      padding: 15px 20px;
      font-size: 15px;
      height: 300px;
      scroll-behavior: smooth;
    }
    
    /* Individual message */
    .abeai-message {
      margin-bottom: 15px;
      display: flex;
      align-items: flex-start;
    }
    
    .abeai-avatar {
      width: 30px;
      height: 30px;
      margin-right: 10px;
      border-radius: 50%;
    }
    
    .abeai-message-content {
      background: #f5f5f5;
      border-radius: 12px;
      padding: 10px 15px;
      max-width: 80%;
    }
    
    /* User message */
    .abeai-message.abeai-user {
      flex-direction: row-reverse;
    }
    
    .abeai-message.abeai-user .abeai-message-content {
      background: var(--primary);
      color: white;
    }
    
    /* Bot message */
    .abeai-message.abeai-bot .abeai-message-content {
      background: #f0f0f0;
    }
    
    /* Loading animation */
    .abeai-typing-indicator {
      background: #f0f0f0;
      border-radius: 12px;
      padding: 15px;
      display: flex;
      align-items: center;
    }
    
    .abeai-typing-indicator span {
      width: 8px;
      height: 8px;
      background: #888;
      border-radius: 50%;
      display: inline-block;
      margin: 0 2px;
      opacity: 0.4;
      animation: typing 1s infinite ease-in-out;
    }
    
    .abeai-typing-indicator span:nth-child(1) {
      animation-delay: 0s;
    }
    
    .abeai-typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .abeai-typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes typing {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    
    /* Predefined options */
    .abeai-quick-options {
      padding: 10px;
      background: var(--background);
      display: block;
      border-top: 1px solid #ddd;
    }
    
    .abeai-options-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
    }
    
    .abeai-options-grid button {
      display: block;
      width: 100%;
      text-align: left;
      padding: 10px;
      background: var(--secondary);
      color: white;
      border-radius: 5px;
      font-size: 14px;
      border: none;
      cursor: pointer;
      transition: var(--transition);
    }
    
    .abeai-options-grid button:hover {
      opacity: 0.9;
    }
    
    /* Input area */
    .abeai-input-area {
      display: flex;
      padding: 12px;
      border-top: 2px solid var(--primary);
    }
    
    .abeai-input {
      flex-grow: 1;
      border: 1px solid #ccc;
      padding: 10px;
      border-radius: 6px;
      font-family: inherit;
      font-size: 15px;
    }
    
    .abeai-send-btn {
      background-color: var(--secondary);
      color: white;
      padding: 10px 15px;
      margin-left: 5px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      transition: var(--transition);
    }
    
    .abeai-send-btn:hover {
      opacity: 0.9;
    }
    
    /* Minimized chat button - Perfectly centered vertical layout */
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
    
    /* Top text box */
    .abeai-bubble-hint {
      background: var(--primary);
      color: white;
      padding: 8px 15px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      width: max-content;
      text-align: center;
    }
    
    /* Bottom text box */
    .abeai-bubble-prompt {
      background: var(--primary);
      color: white;
      padding: 8px 15px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      width: max-content;
      text-align: center;
    }
    
    /* Centered logo bubble with enhanced animation */
    .abeai-bubble {
      width: 60px;
      height: 60px;
      background: var(--background);
      border-radius: 50%;
      box-shadow: 0 4px 10px var(--shadow);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulseBigger 2s infinite;
    }
    
    .abeai-bubble-logo {
      width: 35px;
      height: 35px;
    }
    
    /* Stronger pulse animation */
    @keyframes pulseBigger {
      0% { transform: scale(1); }
      50% { transform: scale(1.15); }
      100% { transform: scale(1); }
    }
    
    /* Mobile responsiveness for minimized state */
    @media (max-width: 480px) {
      .abeai-minimized {
        bottom: 20px;
        right: 20px;
      }
    }
  `;
  
  // Add container and styles to body
  document.body.appendChild(chatbotContainer);
  document.head.appendChild(styleTag);
  
  console.log("🟢 AbeAI Chatbot UI created");
}

// Initialize chatbot when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
  console.log("🟢 DOM loaded, initializing AbeAI");
  
  // Create the UI
  createChatbotUI();
  
  // Get DOM elements
  const chatContainer = document.getElementById('chat-container');
  const chatMinimized = document.getElementById('chat-minimized');
  const chatToggle = document.getElementById('chat-toggle');
  const predefinedOptions = document.getElementById('predefined-options');
  const chatMessages = document.getElementById('chat-messages');
  const sendBtn = document.getElementById('send-btn');
  const chatInput = document.getElementById('chat-input');
  
  // Detect if mobile
  const isMobile = window.innerWidth <= 768;
  let isExpanded = !isMobile;
  
  // Show/hide appropriate containers based on initial state
  if (isExpanded) {
    chatContainer.style.display = 'flex';
    chatMinimized.style.display = 'none';
  } else {
    chatContainer.style.display = 'none';
    chatMinimized.style.display = 'flex'; // Changed from 'block' to 'flex'
  }
  
  // Toggle button handler
  chatToggle.onclick = () => {
    isExpanded = !isExpanded;
    chatContainer.style.display = isExpanded ? 'flex' : 'none';
    chatMinimized.style.display = isExpanded ? 'none' : 'flex'; // Changed from 'block' to 'flex'
    chatToggle.textContent = isExpanded ? '−' : '+';
  };
  
  // Minimized button handler
  chatMinimized.onclick = () => {
    isExpanded = true;
    chatContainer.style.display = 'flex';
    chatMinimized.style.display = 'none';
    chatToggle.textContent = '−';
  };
  
  // Predefined messages
  const predefinedMessages = [
    "Can you please analyse my BMI?",
    "How many calories should I eat daily to lose weight?",
    "Give me 20 high-protein snack ideas?",
    "Create a kid-friendly lunchbox meal plan?",
    "Suggest budget-friendly meal prep recipes for this week?"
  ];
  
  // Add predefined message buttons
  predefinedMessages.forEach((msg) => {
    const button = document.createElement("button");
    button.textContent = msg;
    button.onclick = async () => {
      // Create user message in chat
      const userMessageElement = document.createElement("div");
      userMessageElement.className = "abeai-message abeai-user";
      userMessageElement.innerHTML = `
        <div class="abeai-message-content">${msg}</div>
      `;
      chatMessages.appendChild(userMessageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // Hide predefined options during processing
      document.getElementById('predefined-selections').style.display = 'none';
      
      // Send to backend
      await sendMessage(msg);
    };
    predefinedOptions.appendChild(button);
  });
  
  // Send button handler
  sendBtn.onclick = async () => {
    const userMessage = chatInput.value.trim();
    if (userMessage) {
      chatInput.value = '';
      
      // Create user message in chat
      const userMessageElement = document.createElement("div");
      userMessageElement.className = "abeai-message abeai-user";
      userMessageElement.innerHTML = `
        <div class="abeai-message-content">${userMessage}</div>
      `;
      chatMessages.appendChild(userMessageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // Hide predefined options during processing
      document.getElementById('predefined-selections').style.display = 'none';
      
      // Send to backend
      await sendMessage(userMessage);
    }
  };
  
  // Enter key handler for input
  chatInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      const userMessage = chatInput.value.trim();
      if (userMessage) {
        chatInput.value = '';
        
        // Create user message in chat
        const userMessageElement = document.createElement("div");
        userMessageElement.className = "abeai-message abeai-user";
        userMessageElement.innerHTML = `
          <div class="abeai-message-content">${userMessage}</div>
        `;
        chatMessages.appendChild(userMessageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Hide predefined options during processing
        document.getElementById('predefined-selections').style.display = 'none';
        
        // Send to backend
        await sendMessage(userMessage);
      }
    }
  });
  
  // Send welcome message after a delay
  setTimeout(async () => {
    await sendMessage("welcome");
  }, 1000);
});
