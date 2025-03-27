// AbeAI Chatbot - Complete Implementation with Monetization Triggers
// This version uses Cloudflare Workers as a reliable proxy and includes all monetization triggers
console.log("🟢 AbeAI Chatbot initializing");

// Configuration
const CONFIG = {
  // Using Cloudflare Worker proxy to avoid CORS issues
  proxyUrl: "https://abeai-proxy.downscaleweightloss.workers.dev",
  // Branding assets - use direct URL
 logoUrl: "https://abeai-chatbot-webflow-y8ks.vercel.app/abeailogo.png",
  // Brand colors for consistent styling
  colors: {
    primary: "#5271ff", // Blue
    secondary: "#b68a71", // Brown
    background: "#f7f2d3", // Cream
    text: "#666d70",      // Gray
    darkText: "#333333"   // Dark text for readability
  }
};

// Create unique user ID or retrieve existing
const userId = localStorage.getItem("abeai_user_id") || crypto.randomUUID();
if (!localStorage.getItem("abeai_user_id")) {
  localStorage.setItem("abeai_user_id", userId);
}

// Default to PAYG subscription tier - would be replaced with actual auth
let userSubscriptionTier = localStorage.getItem("abeai_tier") || "PAYG";

// Monetization triggers and subscription logic
const MONETIZATION_TRIGGERS = {
  // Body Metrics Analysis
  metrics: {
    keywords: ["bmi", "body fat", "calories", "tdee", "waist", "weight", "measurements"],
    category: "metrics",
    freeSuggestion: "I can provide basic metrics analysis, but for detailed tracking and personalized guidance, you might consider our PAYG or Premium options.",
    tier: ["PAYG", "Essentials", "Premium"]
  },
  // Nutrition Plans / Snack Ideas
  nutrition: {
    keywords: ["snack", "meal", "protein", "high-protein", "recipe", "diet", "food", "nutrition", "eat"],
    category: "nutrition",
    freeSuggestion: "Here are a few ideas to get you started! For personalized meal plans and shopping lists, consider our Essentials or Premium subscriptions.",
    tier: ["Essentials", "Premium"]
  },
  // Activity / Exercise
  activity: {
    keywords: ["workout", "exercise", "band", "triathlon", "swim", "walk", "run", "gym", "activity", "fitness"],
    category: "activity",
    freeSuggestion: "I can provide some basic guidance on this. For a complete weekly plan tailored to your goals, check out our Essentials or Premium subscriptions.",
    tier: ["Essentials", "Premium"]
  },
  // Hydration Goals
  hydration: {
    keywords: ["water", "hydration", "drink", "fluid"],
    category: "hydration",
    freeSuggestion: "Staying hydrated is important! For a personalized hydration tracker with daily reminders, consider our Essentials or Premium packages.",
    tier: ["Essentials", "Premium"]
  },
  // Sleep & Mental Health
  mentalHealth: {
    keywords: ["stress", "sleep", "mindset", "mood", "anxiety", "mental", "depression", "emotion"],
    category: "mental_health",
    freeSuggestion: "I can offer some basic tips here. For comprehensive mental health tracking and personalized support, our Premium tier includes these features.",
    tier: ["Premium"]
  },
  // Planning & Diary
  planning: {
    keywords: ["log", "track", "diary", "journal", "plan", "record"],
    category: "planning",
    freeSuggestion: "Basic tracking is available, but for a comprehensive health diary that syncs nutrition, activity, and goals, consider our Premium support.",
    tier: ["Premium"]
  },
  // Clinical & Medication
  medication: {
    keywords: ["medication", "injection", "side effects", "dose", "mounjaro", "wegovy", "ozempic", "saxenda", "drug", "phentermine", "contrave", "qsymia", "metformin"],
    category: "medication",
    freeSuggestion: "For secure, password-protected medication guidance including administration tips and side effect management, our Premium tier offers comprehensive support.",
    tier: ["Premium"]
  },
  // Intimacy & Relationship Coaching
  intimacy: {
    keywords: ["intimacy", "relationship", "sex", "desire", "partner", "marriage", "couple"],
    category: "intimacy",
    freeSuggestion: "Thank you for trusting me with this. For secure, guided support around intimacy and relationships, our Premium coaching includes a password-protected module.",
    tier: ["Premium"]
  },
  // Child / Teen Nutrition
  childNutrition: {
    keywords: ["kids", "lunchbox", "adolescent", "family", "child", "teen", "son", "daughter"],
    category: "child_nutrition",
    freeSuggestion: "I can help with some basic advice for children's nutrition. For parent-managed nutrition plans and lunchbox ideas, our Essentials or Premium tiers offer complete support.",
    tier: ["Essentials", "Premium"]
  },
  // Booking Appointments (AU only)
  booking: {
    keywords: ["book", "appointment", "downscale", "doctor", "clinician", "specialist"],
    category: "booking",
    freeSuggestion: "If you're in Australia, our Premium tier includes fast-track booking with Downscale clinicians for personalized care.",
    tier: ["Premium"]
  }
};

// Local fallback responses for common questions (in case backend fails)
const FALLBACK_RESPONSES = {
  welcome: "Hello! I'm AbeAI, your personal health coach. How can I help you today?",
  bmi: "BMI is a simple measure using your height and weight. While it has limitations, it can be a starting point for health discussions. For a personalized analysis, I'd need your height and weight.",
  protein_snacks: "Here are 5 high-protein snack ideas: 1) Greek yogurt with berries, 2) Hard-boiled eggs, 3) Turkey and cheese roll-ups, 4) Cottage cheese with fruit, 5) Edamame. For a complete list of 20+ options tailored to your preferences, consider our Essentials subscription.",
  water: "Staying hydrated is essential for overall health. Most adults should aim for about 2-3 liters of water daily, but this varies based on activity level, climate, and individual needs. Our Essentials tier includes a personalized hydration tracker with reminders.",
  meal_plan: "For balanced nutrition, focus on protein, healthy fats, and fiber-rich carbs. A simple approach is to fill half your plate with vegetables, a quarter with protein, and a quarter with whole grains. For personalized meal planning that fits your lifestyle and goals, our Essentials tier provides comprehensive support.",
  exercise: "Regular physical activity is key for weight management and overall health. Even 30 minutes of walking daily can make a difference. For a customized exercise plan that accounts for your preferences and goals, consider our Essentials or Premium subscription.",
  medication: "Medication can be an important part of weight management for some individuals. For secure, evidence-based guidance on weight management medications and side effect management, consider our Premium tier which includes password-protected medication support.",
  generic: "I'm here to help with your health and wellness journey. For personalized guidance, please ask specific questions about nutrition, activity, hydration, or other aspects of your wellness."
};

// Detect monetization triggers in user message
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

// Function to get local fallback response
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage === "welcome") return FALLBACK_RESPONSES.welcome;
  if (lowerMessage.includes("bmi")) return FALLBACK_RESPONSES.bmi;
  if (lowerMessage.includes("protein") && lowerMessage.includes("snack")) return FALLBACK_RESPONSES.protein_snacks;
  if (lowerMessage.includes("water") || lowerMessage.includes("hydration")) return FALLBACK_RESPONSES.water;
  if (lowerMessage.includes("meal") || lowerMessage.includes("food") || lowerMessage.includes("eat")) return FALLBACK_RESPONSES.meal_plan;
  if (lowerMessage.includes("exercise") || lowerMessage.includes("workout") || lowerMessage.includes("activity")) return FALLBACK_RESPONSES.exercise;
  if (lowerMessage.includes("medication") || lowerMessage.includes("ozempic") || lowerMessage.includes("wegovy") || lowerMessage.includes("drug")) return FALLBACK_RESPONSES.medication;
  
  return FALLBACK_RESPONSES.generic;
}

// Function to check if user has access to feature based on subscription tier
function hasAccessToFeature(triggerInfo) {
  if (!triggerInfo) return true;
  
  return triggerInfo.tier.includes(userSubscriptionTier);
}

// Helper function to send messages via Cloudflare Worker proxy
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
    
    console.log(`🔄 Sending message with tier: ${userSubscriptionTier}`);
    
    // Detect if we need to show a monetization suggestion
    const triggerInfo = detectTriggers(userMessage);
    let showUpgradeSuggestion = false;
    let aiMessage = "";
    
    // Check if user has access to this feature or needs an upgrade
    if (triggerInfo && !hasAccessToFeature(triggerInfo)) {
      showUpgradeSuggestion = true;
      aiMessage = triggerInfo.freeSuggestion;
    } else {
      try {
        // Send request through Cloudflare Worker proxy to avoid CORS issues
        const response = await fetch(CONFIG.proxyUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: userMessage,
            user_id: userId,
            subscription_tier: userSubscriptionTier,
            trigger: triggerInfo ? triggerInfo.category : null,
            ...additionalData
          }),
        });
        
        // Check for successful response
        if (response.ok) {
          const data = await response.json();
          aiMessage = data.response || data.message || "I'm having trouble with that request right now.";
          
          // Check if the backend suggests an upgrade
          if (data.upgrade_suggested) {
            showUpgradeSuggestion = true;
          }
        } else {
          // Fall back to local responses if server fails
          console.warn("Server returned error status. Using fallback response.");
          aiMessage = getFallbackResponse(userMessage);
          
          // If we detected a trigger, suggest upgrade
          if (triggerInfo) {
            showUpgradeSuggestion = true;
          }
        }
      } catch (error) {
        // Network or other error, use fallback
        console.error("Network error:", error);
        aiMessage = getFallbackResponse(userMessage);
        
        // If we detected a trigger, suggest upgrade
        if (triggerInfo) {
          showUpgradeSuggestion = true;
        }
      }
    }
    
    // Remove loading indicator
    loadingMessage.remove();
    
    // Create bot message element
    const botMessage = document.createElement("div");
    botMessage.className = "abeai-message abeai-bot";
    botMessage.innerHTML = `
      <img src="${CONFIG.logoUrl}" class="abeai-avatar" alt="AbeAI Logo" />
      <div class="abeai-message-content">${aiMessage}</div>
    `;
    chatMessages.appendChild(botMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Check if we should show an upgrade button
    if (showUpgradeSuggestion) {
      const upgradeButton = document.createElement("button");
      upgradeButton.className = "abeai-upgrade-btn";
      upgradeButton.textContent = "Explore Subscription Options";
      upgradeButton.onclick = () => {
        window.open("https://www.downscaleai.com/products", "_blank");
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
      chatMessages.appendChild(upgradeButton);
    }
    
    // Re-enable predefined selections if present
    const predefinedEl = document.getElementById('predefined-selections');
    if (predefinedEl) predefinedEl.style.display = 'block';
    
    return aiMessage;
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
        I apologize, but I'm having trouble connecting right now. Please try again in a moment.
      </div>
    `;
    chatMessages.appendChild(errorMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Re-enable predefined selections
    const predefinedEl = document.getElementById('predefined-selections');
    if (predefinedEl) predefinedEl.style.display = 'block';
    
    return "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
  }
}

// For development/testing - function to change subscription tier
function setSubscriptionTier(tier) {
  if (["PAYG", "Essentials", "Premium", "Clinical"].includes(tier)) {
    userSubscriptionTier = tier;
    localStorage.setItem("abeai_tier", tier);
    console.log(`Subscription tier set to: ${tier}`);
    return true;
  }
  return false;
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
  
  // Append styles for chatbot - ENHANCED STYLING
  const styleTag = document.createElement("style");
  styleTag.textContent = `
    /* AbeAI Chatbot Styles - Enhanced for better readability */
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
      padding: 16px;
      font-weight: bold;
      font-size: 17px;
      border-radius: var(--border-radius) var(--border-radius) 0 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--secondary);
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
      font-weight: 700;
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
      padding: 16px;
      font-size: 16px;
      height: 320px;
      scroll-behavior: smooth;
      background: #fafafa;
    }
    
    /* Individual message */
    .abeai-message {
      margin-bottom: 16px;
      display: flex;
      align-items: flex-start;
    }
    
    .abeai-avatar {
      width: 36px;
      height: 36px;
      margin-right: 12px;
      border-radius: 50%;
      border: 2px solid var(--background);
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .abeai-message-content {
      background: var(--background);
      color: var(--dark-text);
      border-radius: 12px;
      padding: 16px;
      max-width: 80%;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      border: 1px solid var(--secondary);
      font-weight: 500;
    }
    
    /* User message */
    .abeai-message.abeai-user {
      flex-direction: row-reverse;
    }
    
    .abeai-message.abeai-user .abeai-message-content {
      background: var(--primary);
      color: white;
      border: none;
    }
    
    /* Upgrade button */
    .abeai-upgrade-btn {
      background: var(--secondary);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 16px;
      margin: 12px auto;
      display: block;
      cursor: pointer;
      font-weight: 600;
      transition: var(--transition);
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .abeai-upgrade-btn:hover {
      background: #a07965;
      transform: translateY(-2px);
    }
    
    /* Loading animation */
    .abeai-typing-indicator {
      background: var(--background);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      border: 1px solid var(--secondary);
    }
    
    .abeai-typing-indicator span {
      width: 8px;
      height: 8px;
      background: var(--secondary);
      border-radius: 50%;
      display: inline-block;
      margin: 0 2px;
      opacity: 0.7;
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
      padding: 12px;
      background: var(--background);
      display: block;
      border-top: 1px solid var(--secondary);
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
      padding: 12px 16px;
      background: var(--secondary);
      color: white;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: var(--transition);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .abeai-options-grid button:hover {
      background: #a07965;
      transform: translateY(-2px);
    }
    
    /* Input area */
    .abeai-input-area {
      display: flex;
      padding: 12px 16px;
      border-top: 2px solid var(--primary);
      background: white;
    }
    
    .abeai-input {
      flex-grow: 1;
      border: 1px solid #ccc;
      padding: 12px;
      border-radius: 6px;
      font-family: inherit;
      font-size: 16px;
    }
    
    .abeai-send-btn {
      background-color: var(--secondary);
      color: white;
      padding: 12px 16px;
      margin-left: 8px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-weight: 600;
      transition: var(--transition);
    }
    
    .abeai-send-btn:hover {
      background: #a07965;
      transform: translateY(-2px);
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
      padding: 10px 16px;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 600;
      width: max-content;
      text-align: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    
    /* Bottom text box */
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
    }
    
    /* Centered logo bubble with enhanced animation */
    .abeai-bubble {
      width: 64px;
      height: 64px;
      background: var(--background);
      border-radius: 50%;
      box-shadow: 0 4px 10px var(--shadow);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulseBigger 2s infinite;
      border: 2px solid var(--secondary);
    }
    
    .abeai-bubble-logo {
      width: 40px;
      height: 40px;
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
  
  console.log("🟢 AbeAI Chatbot UI created with enhanced styling");
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
    chatMinimized.style.display = 'flex'; // Using flex for vertical layout
  }
  
  // Toggle button handler
  chatToggle.onclick = () => {
    isExpanded = !isExpanded;
    chatContainer.style.display = isExpanded ? 'flex' : 'none';
    chatMinimized.style.display = isExpanded ? 'none' : 'flex';
    chatToggle.textContent = isExpanded ? '−' : '+';
  };
  
  // Minimized button handler
  chatMinimized.onclick = () => {
    isExpanded = true;
    chatContainer.style.display = 'flex';
    chatMinimized.style.display = 'none';
    chatToggle.textContent = '−';
  };
  
  // Predefined messages based on your most important trigger categories
  const predefinedMessages = [
    "Can you analyse my BMI?",
    "How many calories should I eat daily to lose weight?",
    "Give me 20 high-protein snack ideas",
    "Create a kid-friendly lunchbox meal plan",
    "Suggest a simple home workout routine"
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
