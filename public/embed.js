// Updated minimized chatbot HTML structure to match your image
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
  
  <!-- Minimized chat button - Vertical layout -->
  <div id="chat-minimized" class="abeai-minimized">
    <div class="abeai-bubble-hint">Chat with AbeAI</div>
    <div class="abeai-bubble">
      <img src="${CONFIG.logoUrl}" class="abeai-bubble-logo" alt="AbeAI" />
    </div>
    <div class="abeai-bubble-prompt">Press Here</div>
  </div>
`;

// Updated CSS for the minimized state to match your image
styleTag.textContent = `
  /* Other styles remain the same... */
  
  /* Minimized chat button - VERTICAL LAYOUT */
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
  }
  
  /* Centered logo bubble */
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
`;

// Update display style to flex-column
chatMinimized.style.display = isExpanded ? 'none' : 'flex';
