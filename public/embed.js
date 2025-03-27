// AbeAI Chatbot - Final Fixes for chatInput error
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

document.addEventListener("DOMContentLoaded", function () {
  console.log("🟢 DOM loaded, initializing AbeAI");
  createChatbotUI();

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

