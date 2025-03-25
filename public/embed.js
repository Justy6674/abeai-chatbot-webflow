console.log("Chatbot script started");

const supabaseFunctionUrl = "https://lively-disk-e2ab.downscaleweightloss.workers.dev";
const logoDirectUrl = "https://abeai-chatbot-webflow.vercel.app/abeai1.png";

async function sendMessage(userMessage, userInfo = null, metricsUpdate = null, activityUpdate = null) {
  try {
    console.log("Sending message to Cloudflare Worker:", userMessage, "URL:", supabaseFunctionUrl);
    const loadingMessage = document.createElement("div");
    loadingMessage.className = "abeai-message loading";
    loadingMessage.innerHTML = `
      <img src="${logoDirectUrl}" width="30px" alt="AbeAi Logo" style="margin-right: 10px;" />
      <span class="loading-spinner"></span>
    `;
    chatMessages.appendChild(loadingMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const response = await fetch(supabaseFunctionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMessage,
        userId: userId,
        userInfo,
        metricsUpdate,
        activityUpdate
      }),
    });

    const data = await response.json();
    loadingMessage.remove();

    const aiMessage = data.response || data.message || "No response message found.";
    const botMessage = document.createElement("div");
    botMessage.className = "abeai-message abeai-bot";
    botMessage.innerHTML = `<img src="${logoDirectUrl}" width="30px" alt="AbeAi Logo" style="margin-right: 12px;" /><span>${aiMessage}</span>`;
    chatMessages.appendChild(botMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return aiMessage;
  } catch (error) {
    console.error("Chatbot error:", error);
    const existingLoading = document.querySelector(".abeai-message.loading");
    if (existingLoading) existingLoading.remove();

    const errorMessage = document.createElement("div");
    errorMessage.className = "abeai-message abeai-bot";
    errorMessage.textContent = "Sorry, something went wrong. Please try again.";
    chatMessages.appendChild(errorMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return "Error";
  }
}

const userId = localStorage.getItem("userId") || crypto.randomUUID();
localStorage.setItem("userId", userId);

document.addEventListener("DOMContentLoaded", function () {
  const predefinedMessages = [
    "Can you please analyse my BMI?",
    "How many calories should I eat daily to lose weight?",
    "Give me 20 high-protein snack ideas?",
    "Create a kid-friendly lunchbox meal plan?",
    "Suggest budget-friendly meal prep recipes for this week?",
    "Analyse my sleep data and suggest improvements!",
    "Send me reminders to drink water today!",
    "Create a home workout plan suitable for a busy mum!",
    "Give me a body metrics health report",
    "Suggest resistance band workouts I can do anywhere"
  ];

  const chatBox = document.createElement("div");
  chatBox.innerHTML = `
    <div id="chat-container" style="position: fixed; bottom: 30px; right: 30px; width: 360px; max-height: 850px; background: #ffffff; box-shadow: 0 8px 20px rgba(0,0,0,0.3); border-radius: 15px; display: flex; flex-direction: column; z-index: 9999; font-family: 'Helvetica Neue', sans-serif; overflow: hidden;">
      <div id="chat-header" style="background: #f7f2d3; color: #333; padding: 12px; font-weight: bold; font-size: 17px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center;">
          <img src="${logoDirectUrl}" width="30" alt="AbeAi Logo" style="margin-right:10px;" />
          <span style="color: #5271ff;">AbeAI</span> Health Coach
        </div>
        <span id="chat-toggle" style="cursor: pointer;">–</span>
      </div>
      <div id="chat-messages" style="flex-grow: 1; overflow-y: auto; padding: 15px; background: #fff;"></div>
      <div id="predefined-selections" style="padding: 10px; border-top: 1px solid #eee; background: #f9f9f9;">
        <div id="predefined-options"></div>
      </div>
      <div id="chat-input-area" style="display: flex; padding: 10px; border-top: 1px solid #ccc;">
        <input id="chat-input" type="text" placeholder="Ask AbeAI..." style="flex: 1; border-radius: 5px; padding: 10px; border: 1px solid #ccc;" />
        <button id="send-btn" style="margin-left: 10px; background: #b68a71; color: #fff; border: none; padding: 10px 15px; border-radius: 5px;">Send</button>
      </div>
    </div>
  `;

  document.body.appendChild(chatBox);

  window.chatMessages = document.getElementById("chat-messages");

  predefinedMessages.forEach(msg => {
    const button = document.createElement("button");
    button.textContent = msg;
    button.style = "margin: 4px; padding: 8px 10px; border-radius: 5px; border: none; background: #5271ff; color: #fff; font-size: 13px;";
    button.onclick = async () => {
      const userMessage = document.createElement("div");
      userMessage.className = "abeai-message abeai-user";
      userMessage.textContent = msg;
      chatMessages.appendChild(userMessage);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      await sendMessage(msg);
    };
    document.getElementById("predefined-options").appendChild(button);
  });

  document.getElementById("send-btn").onclick = async () => {
    const chatInput = document.getElementById("chat-input");
    const message = chatInput.value.trim();
    if (!message) return;
    chatInput.value = "";

    const userMessage = document.createElement("div");
    userMessage.className = "abeai-message abeai-user";
    userMessage.textContent = message;
    chatMessages.appendChild(userMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    await sendMessage(message);
  };
});
