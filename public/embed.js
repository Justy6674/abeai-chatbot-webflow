console.log("🟢 Chatbot script started");

const supabaseUrl = "https://haxnyisxrvdetcqaftdb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheG55aXN4cnZkZXRjcWFmdGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MDgyMzIsImV4cCI6MjA1ODM4NDIzMn0.Nk9n9dkYEwIfY-LgAblzcVcRqyylsvTIh6p_Rh1eNW0";
const logoDirectUrl = "https://abeai-chatbot-webflow-y8ks.vercel.app/abeailogo.png";

async function sendMessage(userMessage, userInfo = null, metricsUpdate = null, activityUpdate = null) {
  try {
    console.log("🔁 Sending message to Supabase:", userMessage);
    const loadingMessage = document.createElement("div");
    loadingMessage.className = "abeai-message loading";
    loadingMessage.innerHTML = `
      <img src="${logoDirectUrl}" width="30px" alt="AbeAi Logo" style="margin-right: 10px;" />
      <span class="loading-spinner"></span>
    `;
    chatMessages.appendChild(loadingMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const response = await fetch(`${supabaseUrl}/functions/v1/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseAnonKey,
        "Authorization": `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        message: userMessage,
        user_id: userId,
        user_info: userInfo || null,
        metrics_update: metricsUpdate || null,
        activity_update: activityUpdate || null
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Supabase insert failed:", errorText);
      throw new Error(`Supabase error: ${response.status}`);
    }

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    const aiMessage = data.response || "No message returned.";
    loadingMessage.remove();

    const botMessage = document.createElement("div");
    botMessage.className = "abeai-message abeai-bot";
    botMessage.innerHTML = `<img src="${logoDirectUrl}" width="30px" alt="AbeAi Logo" style="margin-right: 12px;" /><span>${aiMessage}</span>`;
    chatMessages.appendChild(botMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    document.getElementById('predefined-selections').style.display = 'block';
    return aiMessage;
  } catch (error) {
    console.error("🔥 Supabase failed with error:", error.message);
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
  console.log("DOM fully loaded, chatbot ready");

  const chatBox = document.createElement("div");
  chatBox.innerHTML = `
    <div id="chat-container" style="position: fixed; bottom: 30px; right: 30px; width: 360px; max-height: 850px; background: #ffffff; box-shadow: 0 8px 20px rgba(0,0,0,0.3); border-radius: 15px; display: flex; flex-direction: column; z-index: 9999; font-family: 'Open Sans', 'Helvetica Neue', sans-serif; transition: all 0.3s ease-in-out; resize: vertical; overflow: auto;">
      <div id="chat-header" style="background: #f7f2d3; color: #333; padding: 12px; font-weight: bold; font-size: 17px; border-radius: 15px 15px 0 0; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center;">
          <img src="${logoDirectUrl}" width="30" alt="AbeAi Logo" style="margin-right:10px;" />
          <span style="color: #5271ff;">AbeAI</span> Health Coach
        </div>
        <span id="chat-toggle" style="cursor: pointer; font-size: 20px; color: #333;">–</span>
      </div>
      <div id="chat-messages" style="flex-grow: 1; overflow-y: auto; padding: 15px 20px; font-size: 15px;"></div>
      <div id="predefined-selections" style="padding: 10px; background: #f7f2d3; display: block; border-top: 1px solid #ccc;">
        <div id="predefined-options-limited"></div>
      </div>
      <div id="chat-input-area" style="display: flex; padding: 12px; border-top: 2px solid #5271ff;">
        <input type="text" id="chat-input" placeholder="Ask AbeAI or select..." style="flex-grow: 1; border: 1px solid #ccc; padding: 10px; border-radius: 6px;" />
        <button id="send-btn" style="background-color: #b68a71; color: white; padding: 10px 15px; margin-left: 5px; border-radius: 6px; border: none;">Send</button>
      </div>
    </div>
    <div id="chat-minimized" style="position: fixed; bottom: 30px; right: 30px; z-index: 9999; cursor: pointer; text-align: center;">
      <div style="background: #5271ff; color: white; padding: 5px 10px; border-radius: 6px; font-size: 14px; margin-bottom: 5px;">
        Chat with AbeAI
      </div>
      <div style="width: 60px; height: 60px; background: #f7f2d3; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.2); animation: pulse 1.5s infinite;">
        <img src="${logoDirectUrl}" width="40" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);" />
      </div>
      <div style="background: #5271ff; color: white; padding: 5px 10px; border-radius: 6px; font-size: 12px; margin-top: 5px;">
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

  let isMobile = window.innerWidth <= 768;
  let isExpanded = !isMobile;

  if (isExpanded) {
    chatContainer.style.display = 'flex';
    chatMinimized.style.display = 'none';
  } else {
    chatContainer.style.display = 'none';
    chatMinimized.style.display = 'block';
  }

  chatToggle.onclick = () => {
    isExpanded = !isExpanded;
    chatContainer.style.display = isExpanded ? 'flex' : 'none';
    chatMinimized.style.display = isExpanded ? 'none' : 'block';
    chatToggle.textContent = isExpanded ? '–' : '+';
  };

  chatMinimized.onclick = () => {
    isExpanded = true;
    chatContainer.style.display = 'flex';
    chatMinimized.style.display = 'none';
    chatToggle.textContent = '–';
  };

  let predefinedMessages = [
    "Can you please analyse my BMI?",
    "How many calories should I eat daily to lose weight?",
    "Give me 20 high-protein snack ideas?",
    "Create a kid-friendly lunchbox meal plan?",
    "Suggest budget-friendly meal prep recipes for this week?"
  ];

  predefinedMessages.forEach((msg) => {
    const button = document.createElement("button");
    button.textContent = msg;
    button.style = "display: block; width: 100%; text-align: left; padding: 10px; margin: 4px 0; background: #b68a71; color: #fff; border-radius: 5px; font-size: 14px;";
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
});
// Webhook test at Wed 26 Mar 2025 21:14:31 AEST
