console.log("Chatbot script started");
const supabaseUrl = "https://haxnyisxrvdetcqaftdb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheG55aXN4cnZkZXRjcWFmdGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MDgyMzIsImV4cCI6MjA1ODM4NDIzMn0.Nk9n9dkYEwIfY-LgAblzcVcRqyylsvTIh6p_Rh1eNW0";

const logoDirectUrl = "https://abeai-chatbot-webflow-oavjinhty-downscale.vercel.app/abeailogo.png";
async function sendMessage(userMessage, userInfo = null, metricsUpdate = null, activityUpdate = null) {
  try {
    console.log("Sending message to Supabase:", userMessage, "URL:", supabaseUrl);
    const loadingMessage = document.createElement("div");
    loadingMessage.className = "abeai-message loading";
    loadingMessage.innerHTML = `
      <img src="${logoDirectUrl}" width="30px" alt="AbeAi Logo" style="margin-right: 10px;" onerror="console.error('Failed to load logo in message: ', this.src); this.src='https://via.placeholder.com/30?text=Logo';"/>
      <span class="loading-spinner"></span>
    `;
    chatMessages.appendChild(loadingMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Call Supabase directly (assuming a 'messages' table or Edge Function)
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/send_message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseAnonKey,
        "Authorization": `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        message: userMessage,
        user_id: userId,
        user_info: userInfo || null,
        metrics_update: metricsUpdate || null,
        activity_update: activityUpdate || null
      }),
    });

    console.log("Supabase response status:", response.status);
    console.log("Supabase response headers:", [...response.headers.entries()]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response body:", errorText);
      throw new Error(`Supabase error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Supabase response data:", data);

    if (data.error) throw new Error(data.error);

    const aiMessage = data.response || data.message || "No response message found";
    console.log("Received response from Supabase:", aiMessage);
    loadingMessage.remove();

    const botMessage = document.createElement("div");
    botMessage.className = "abeai-message abeai-bot";
    botMessage.innerHTML = `<img src="${logoDirectUrl}" width="30px" alt="AbeAi Logo" style="margin-right: 12px;"/><span>${aiMessage}</span>`;
    chatMessages.appendChild(botMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    document.getElementById('predefined-selections').style.display = 'block';
    return aiMessage;
  } catch (error) {
    console.error("Supabase failed with error:", error.message);
    const existingLoading = document.querySelector(".abeai-message.loading");
    if (existingLoading) existingLoading.remove();

    const errorMessage = document.createElement("div");
    errorMessage.className = "abeai-message abeai-bot";
    errorMessage.textContent = "Sorry, I couldn’t process your request. Try again soon.";
    chatMessages.appendChild(errorMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    document.getElementById('predefined-selections').style.display = 'block';
    return "Sorry, I couldn’t process your request. Try again soon.";
  }
}

const userId = localStorage.getItem("userId") || crypto.randomUUID();
if (!localStorage.getItem("userId")) localStorage.setItem("userId", userId);

document.addEventListener("DOMContentLoaded", async function () {
  console.log("DOM fully loaded, creating chatbot...");
  let predefinedMessages = [
    "Can you please analyse my BMI?",
    "How many calories should I eat daily to lose weight?",
    "Give me 20 high-protein snack ideas?",
    "Create a kid-friendly lunchbox meal plan?",
    "Suggest budget-friendly meal prep recipes for this week?",
    "What should my daily protein intake be?",
    "Analyse my sleep data and suggest improvements!",
    "Send me reminders to drink water today!",
    "Create a home workout plan suitable for a busy mum!",
    "Suggest resistance band exercises I can do anywhere!",
    "Give me a body metrics health report based on my measurements!",
    "Provide stress-management tips to aid my weight loss!",
    "Help me set realistic micro-goals for today!",
    "Suggest budget-friendly grocery swaps for Woolworths or Coles!",
    "Connect my fitness tracker for personalised coaching!",
    "Analyse my sleep patterns and suggest improvements!",
    "I want a nutrition plan tailored for my kids’school lunchboxes!",
    "Generate high-protein snack ideas perfect for travel!",
    "I need quick meal-prep recipes for a busy week!",
    "Can you build me an affordable weekly meal plan?",
    "Tell me how many calories I should consume daily?"
  ];

  const chatBox = document.createElement("div");
  chatBox.innerHTML = `
    <div id="chat-container" style="position: fixed; bottom: 30px; right: 30px; width: 360px; max-height: 850px; background: #ffffff; box-shadow: 0 8px 20px rgba(0,0,0,0.3); border-radius: 15px; display: flex; flex-direction: column; z-index: 9999; font-family: 'Arial', sans-serif; transition: all 0.3s ease-in-out; resize: vertical; overflow: auto;">
      <div id="chat-header" style="background: #f7f2d3; color: #333; padding: 12px; font-weight: bold; font-size: 17px; border-radius: 15px 15px 0 0; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center;">
          <img id="chat-logo" src="${logoDirectUrl}" width="30" alt="AbeAi Logo" style="margin-right:10px;" onerror="console.error('Failed to load logo: ', this.src); this.src='https://via.placeholder.com/30?text=Logo';"/>
          <span style="color: #4A90E2;">AbeAI</span> Health Coach
        </div>
        <span id="chat-toggle" style="cursor: pointer; font-size: 20px; color: #333;">–</span>
      </div>
      <div style="border-bottom: 2px solid #4A90E2;"></div>
      <div id="chat-messages" style="flex-grow: 1; overflow-y: auto; padding: 15px 20px; background: white; color: #333333; font-size: 14px;">
        <div class="abeai-message abeai-bot initial-content">
          <img src="${logoDirectUrl}" width="30px" alt="AbeAi Logo" style="margin-right: 10px;"/>
          <span>Hello! How can I help you today?</span>
        </div>
      </div>
      <div id="predefined-selections" style="padding: 12px 15px; border-top: 1px solid #e0e0e0; background: #e6e6e6; max-height: 220px; overflow-y: auto;">
        <div id="predefined-options-limited"></div>
        <button id="show-more-btn" style="display: block; margin: 5px auto; padding: 8px 12px; background: #f7f2d3; color: #333; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">Show More</button>
      </div>
      <div id="chat-input-area" style="display: flex; padding: 12px; border-top: 2px solid #4A90E2; background-color: #ffffff; border-radius: 0 0 15px 15px; position: sticky; bottom: 0;">
        <input type="text" id="chat-input" placeholder="ASK ABE AI OR SELECT FROM ABOVE..." style="flex-grow: 1; border: none; outline: none; padding: 10px; border-radius: 8px; background-color: #ffffff; color: #4A90E2; font-weight: bold; font-size: 14px; opacity: 0.6; border: 2px solid transparent; transition: border 0.3s;"/>
        <button id="send-btn" style="background-color: #f7f2d3; color: #333; padding: 10px 15px; margin-left: 5px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px;">Send</button>
      </div>
      <div style="border-top: 2px solid #4A90E2; padding: 5px 15px; background: #f7f2d3; font-size: 12px; color: #666; text-align: center; border-bottom-left-radius: 15px; border-bottom-right-radius: 15px;">
        DownscaleAI - Weight Loss For Life
      </div>
    </div>
    <div id="chat-minimized" style="position: fixed; bottom: 30px; right: 30px; z-index: 9999; cursor: pointer; transition: all 0.3s ease-in-out; text-align: center;">
      <div style="background: #4A90E2; color: #f7f2d3; padding: 5px 10px; border-radius: 5px; font-size: 14px; font-weight: bold; margin-bottom: 5px;">
        Chat with AbeAI
      </div>
      <div style="width: 60px; height: 60px; background: #f7f2d3; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.2); animation: pulse 1.5s infinite; margin: 0 auto;">
        <img src="${logoDirectUrl}" width="40" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);" alt="AbeAi Logo" onerror="console.error('Failed to load logo: ', this.src); this.src='https://via.placeholder.com/40?text=Logo';"/>
      </div>
      <div style="background: #4A90E2; color: #f7f2d3; padding: 5px 10px; border-radius: 5px; font-size: 12px; font-weight: bold; margin-top: 5px;">
        Press Here
      </div>
    </div>
  `;
  document.body.appendChild(chatBox);

  window.chatMessages = document.getElementById('chat-messages');
  const chatContainer = document.getElementById('chat-container');
  const chatMinimized = document.getElementById('chat-minimized');
  const chatToggle = document.getElementById('chat-toggle');
  const predefinedOptionsLimited = document.getElementById('predefined-options-limited');
  const showMoreBtn = document.getElementById('show-more-btn');

  const isMobile = window.innerWidth <= 768;
  let isExpanded = !isMobile;

  if (isExpanded) {
    chatContainer.style.display = 'flex';
    chatMinimized.style.display = 'none';
    chatToggle.textContent = "–";
  } else {
    chatContainer.style.display = 'none';
    chatMinimized.style.display = 'block';
    chatToggle.textContent = "+";
  }

  chatToggle.onclick = () => {
    isExpanded = !isExpanded;
    if (!isExpanded) {
      chatContainer.style.display = 'none';
      chatMinimized.style.display = 'block';
      chatToggle.textContent = "+";
    } else {
      chatContainer.style.display = 'flex';
      chatMinimized.style.display = 'none';
      chatToggle.textContent = "–";
    }
  };

  chatMinimized.onclick = () => {
    isExpanded = true;
    chatContainer.style.display = 'flex';
    chatMinimized.style.display = 'none';
    chatToggle.textContent = "–";
  };

  const limitedMessages = predefinedMessages.slice(0, 5);
  limitedMessages.forEach((msg) => {
    const button = document.createElement("button");
    button.textContent = msg;
    button.style = "display: block; width: 100%; text-align: left; padding: 10px; margin: 4px 0; background: #b68a71; color: #fff; border: 1px solid #ddd; border-radius: 5px; cursor: pointer; font-size: 14px; transition: background 0.3s;";
    button.onmouseover = () => (button.style.background = "#a66d5a");
    button.onmouseout = () => (button.style.background = "#b68a71");
    button.onclick = async () => {
      const userMessageElement = document.createElement("div");
      userMessageElement.className = "abeai-message abeai-user";
      userMessageElement.textContent = msg;
      chatMessages.appendChild(userMessageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      await sendMessage(msg);
    };
    predefinedOptionsLimited.appendChild(button);
  });

  showMoreBtn.onclick = () => {
    const predefinedSelections = document.getElementById('predefined-selections');
    predefinedSelections.innerHTML = '';
    predefinedMessages.forEach((msg) => {
      const button = document.createElement("button");
      button.textContent = msg;
      button.style = "display: block; width: 100%; text-align: left; padding: 10px; margin: 4px 0; background: #b68a71; color: #fff; border: 1px solid #ddd; border-radius: 5px; cursor: pointer; font-size: 14px; transition: background 0.3s;";
      button.onmouseover = () => (button.style.background = "#a66d5a");
      button.onmouseout = () => (button.style.background = "#b68a71");
      button.onclick = async () => {
        const userMessageElement = document.createElement("div");
        userMessageElement.className = "abeai-message abeai-user";
        userMessageElement.textContent = msg;
        chatMessages.appendChild(userMessageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        await sendMessage(msg);
      };
      predefinedSelections.appendChild(button);
    });
  };

  document.getElementById('send-btn').onclick = async () => {
    const chatInput = document.getElementById('chat-input');
    const userMessage = chatInput.value.trim();
    if (userMessage) {
      chatInput.value = '';
      const userMessageElement = document.createElement("div");
      userMessageElement.className = "abeai-message abeai-user";
      userMessageElement.textContent = userMessage;
      chatMessages.appendChild(userMessageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      await sendMessage(userMessage);
    }
  };

  document.getElementById('chat-input').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      const chatInput = document.getElementById('chat-input');
      const userMessage = chatInput.value.trim();
      if (userMessage) {
        chatInput.value = '';
        const userMessageElement = document.createElement("div");
        userMessageElement.className = "abeai-message abeai-user";
        userMessageElement.textContent = userMessage;
        chatMessages.appendChild(userMessageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        await sendMessage(userMessage);
      }
    }
  });

  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    .abeai-message { display: flex; align-items: center; margin: 8px 0; padding: 10px; border-radius: 10px; max-width: 90%; }
    .abeai-message.abeai-bot { background: #f7f2d3; color: #333; }
    .abeai-message.abeai-user { background: #b68a71; color: #fff; }
    .abeai-message img { vertical-align: middle; margin-right: 12px; }
    .abeai-message span { flex-grow: 1; word-wrap: break-word; }
    .abeai-message.initial-content { opacity: 0.7; font-size: 12px; margin-bottom: 15px; }
    .abeai-message.loading { background: #f0f0f0; }
    .loading-spinner { display: inline-block; width: 20px; height: 20px; border: 3px solid #ddd; border-top: 3px solid #4A90E2; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    #chat-input { color: #4A90E2; font-weight: bold; }
    #chat-input:focus { border: 2px solid #4A90E2; background-color: #ffffff; color: #4A90E2; font-weight: bold; }
    #chat-container { position: fixed; bottom: 30px; right: 30px; width: 360px; max-height: 850px; background: #ffffff; box-shadow: 0 8px 20px rgba(0,0,0,0.3); border-radius: 15px; display: flex; flex-direction: column; z-index: 9999; font-family: 'Arial', sans-serif; transition: all 0.3s ease-in-out; }
    #chat-minimized { position: fixed; bottom: 30px; right: 30px; z-index: 9999; cursor: pointer; transition: all 0.3s ease-in-out; text-align: center; }
    #chat-header { background: #f7f2d3; color: #333; padding: 12px; font-weight: bold; font-size: 17px; border-radius: 15px 15px 0 0; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    #chat-messages { flex-grow: 1; overflow-y: auto; padding: 15px 20px; background: white; color: #333333; font-size: 14px; }
    #predefined-selections { padding: 12px 15px; border-top: 1px solid #e0e0e0; background: #e6e6e6; max-height: 220px; overflow-y: auto; }
    #predefined-options-limited button, #predefined-selections button { display: block; width: 100%; text-align: left; padding: 10px; margin: 4px 0; background: #b68a71; color: #fff; border: 1px solid #ddd; border-radius: 5px; cursor: pointer; font-size: 14px; transition: background 0.3s; }
    #predefined-options-limited button:hover, #predefined-selections button:hover { background: #a66d5a; }
    #chat-input-area { display: flex; padding: 12px; border-top: 2px solid #4A90E2; background-color: #ffffff; border-radius: 0 0 15px 15px; position: sticky; bottom: 0; }
    #chat-input { flex-grow: 1; border: none; outline: none; padding: 10px; border-radius: 8px; background-color: #ffffff; color: #4A90E2; font-weight: bold; font-size: 14px; opacity: 0.6; border: 2px solid transparent; transition: border 0.3s; }
    #send-btn { background-color: #f7f2d3; color: #333; padding: 10px 15px; margin-left: 5px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; }
    #chat-input::placeholder { color: #b68a71; opacity: 0.5; font-weight: normal; font-size: 13px; }
    #chat-header { border-bottom: 2px solid #4A90E2; }
    #chat-input-area { border-top: 2px solid #4A90E2; }
    #predefined-selections { border-top: 1px solid #e0e0e0; border-bottom: 2px solid #4A90E2; }
    #show-more-btn { background: #f7f2d3; }
    #chat-minimized div { background: #4A90E2; color: #f7f2d3; padding: 5px 10px; border-radius: 5px; font-size: 14px; font-weight: bold; margin-bottom: 5px; }
    #chat-minimized div:last-child { margin-top: 5px; }
    #chat-minimized img { width: 40px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
    #chat-minimized > div:nth-child(2) { width: 60px; height: 60px; background: #f7f2d3; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.2); animation: pulse 1.5s infinite; margin: 0 auto; position: relative; }
  `;
  document.head.appendChild(style);
});
