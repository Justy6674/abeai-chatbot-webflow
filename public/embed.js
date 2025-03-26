// AbeAI Cloudflare Worker Proxy
// This code should be deployed to your Cloudflare Worker

// The URL of your Supabase Edge Function
const SUPABASE_FUNCTION_URL = "https://haxnyisxrvdetcqaftdb.supabase.co/functions/v1/send-message";

// Monetization tier definitions for fallback in case Supabase is down
const TIERS = {
  PAYG: {
    maxTokens: 100,
    model: "gpt-3.5-turbo",
    allowedTopics: ["basic_metrics", "general_advice"],
  },
  Essentials: {
    maxTokens: 250,
    model: "gpt-3.5-turbo",
    allowedTopics: ["nutrition", "hydration", "basic_activity"],
  },
  Premium: {
    maxTokens: 500,
    model: "gpt-4",
    allowedTopics: ["all"],
  },
  Clinical: {
    maxTokens: 800,
    model: "gpt-4",
    allowedTopics: ["all"],
  },
};

// Detect monetization triggers in user message
function detectTriggers(message) {
  const lowerMessage = message.toLowerCase();
  
  // Nutrition triggers
  if (lowerMessage.includes("meal plan") || 
      lowerMessage.includes("recipe") || 
      lowerMessage.includes("snack") || 
      lowerMessage.includes("protein") ||
      lowerMessage.includes("diet") ||
      lowerMessage.includes("food")) {
    return {
      category: "nutrition",
      upgradeMessage: "I can provide basic nutrition advice, but for personalized meal plans and detailed nutrition guidance, you might consider our Essentials or Premium plans."
    };
  }
  
  // Medication triggers
  if (lowerMessage.includes("medication") || 
      lowerMessage.includes("ozempic") || 
      lowerMessage.includes("wegovy") || 
      lowerMessage.includes("mounjaro") ||
      lowerMessage.includes("zepbound") ||
      lowerMessage.includes("saxenda") ||
      lowerMessage.includes("dose") ||
      lowerMessage.includes("injection")) {
    return {
      category: "medication",
      upgradeMessage: "For detailed medication guidance, including administration tips and side effect management, our Premium plan includes a secure, password-protected medication module."
    };
  }
  
  // Intimacy triggers
  if (lowerMessage.includes("intimacy") || 
      lowerMessage.includes("relationship") || 
      lowerMessage.includes("partner") || 
      lowerMessage.includes("sex") ||
      lowerMessage.includes("sexual") ||
      lowerMessage.includes("marriage")) {
    return {
      category: "intimacy",
      upgradeMessage: "I understand this is a personal topic. Our Premium plan includes a private, password-protected intimacy module with relationship coaching and support."
    };
  }

  // Activity triggers
  if (lowerMessage.includes("workout") || 
      lowerMessage.includes("exercise") || 
      lowerMessage.includes("fitness") || 
      lowerMessage.includes("activity") ||
      lowerMessage.includes("gym") ||
      lowerMessage.includes("training")) {
    return {
      category: "activity",
      upgradeMessage: "For personalized workout plans and activity tracking, consider our Essentials or Premium plans which include comprehensive fitness support."
    };
  }

  // Mental health triggers
  if (lowerMessage.includes("stress") || 
      lowerMessage.includes("anxiety") || 
      lowerMessage.includes("depression") || 
      lowerMessage.includes("mental health") ||
      lowerMessage.includes("mood") ||
      lowerMessage.includes("sleep")) {
    return {
      category: "mental_health",
      upgradeMessage: "For comprehensive mental health support and tracking, our Premium plan includes tools to monitor and improve your emotional wellbeing."
    };
  }

  // No specific trigger detected
  return {
    category: "general",
    upgradeMessage: null
  };
}

// Main event listener for all fetch requests
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// Main request handler function
async function handleRequest(request) {
  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*"
      }
    });
  }

  try {
    // Get request data
    let requestData;
    try {
      requestData = await request.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid JSON in request",
          details: error.message
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    // Extract the user's message and subscription tier
    const { message, user_id, subscription_tier = "PAYG" } = requestData;
    
    if (!message) {
      return new Response(
        JSON.stringify({ 
          error: "Message is required",
          response: "I'm sorry, I didn't receive a message to respond to."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    // For "welcome" message, provide a tier-appropriate greeting
    // This provides a fallback in case Supabase is down
    if (message.toLowerCase() === "welcome") {
      let welcomeMessage = "";
      
      switch(subscription_tier) {
        case "PAYG":
          welcomeMessage = "Hi there! I'm AbeAI, your health assistant. I can provide basic metrics and general guidance. For more personalized support, consider our subscription options!";
          break;
        case "Essentials":
          welcomeMessage = "Welcome! I'm AbeAI, your health coach. I'm here to help with nutrition, hydration, and basic exercise guidance. Let me know how I can support your wellness journey today!";
          break;
        case "Premium":
          welcomeMessage = "Welcome back! I'm AbeAI, your comprehensive health coach. I'm here to provide personalized support for all aspects of your wellness journey - from nutrition and exercise to medication management and relationship wellness.";
          break;
        case "Clinical":
          welcomeMessage = "Welcome to your clinical support session. I'm AbeAI, your advanced health coach with access to clinical resources. I can provide evidence-based guidance on all aspects of your health journey, including detailed medication support.";
          break;
      }
      
      return new Response(
        JSON.stringify({ response: welcomeMessage }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
    
    // Check for triggers that should prompt subscription upgrade
    const triggerInfo = detectTriggers(message);
    
    // Process based on subscription tier and triggers
    if ((subscription_tier === "PAYG" || subscription_tier === "Essentials") && 
        (triggerInfo.category === "medication" || 
         triggerInfo.category === "intimacy" || 
         triggerInfo.category === "mental_health")) {
      
      // Provide basic information with upgrade suggestion
      return new Response(
        JSON.stringify({
          response: triggerInfo.upgradeMessage,
          category: triggerInfo.category,
          upgrade_suggested: true
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
    
    // Forward request to Supabase Edge Function
    try {
      // Add or preserve required headers
      const headers = new Headers(request.headers);
      
      // Create a new request to forward to Supabase
      const supabaseRequest = new Request(SUPABASE_FUNCTION_URL, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestData)
      });
      
      // Send request to Supabase and get response
      let supabaseResponse = await fetch(supabaseRequest);
      
      // Check if the response was successful
      if (!supabaseResponse.ok) {
        // For debugging only - log error status
        console.error(`Supabase Error: ${supabaseResponse.status}`);
        
        // Fallback to a graceful error message if Supabase fails
        return new Response(
          JSON.stringify({
            response: "I'm experiencing some technical difficulties right now. Please try again shortly."
          }),
          {
            status: 200, // Return 200 even on error to avoid confusing the client
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }
      
      // Get the response data
      const responseData = await supabaseResponse.json();
      
      // Create a modified response with CORS headers
      return new Response(
        JSON.stringify(responseData),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache"
          }
        }
      );
    } catch (error) {
      // Handle any errors with forwarding to Supabase
      console.error("Error forwarding to Supabase:", error);
      
      // Return a graceful error response
      return new Response(
        JSON.stringify({
          response: "I'm sorry, there was a problem processing your request. Please try again later."
        }),
        {
          status: 200, // Return 200 even on error for consistent client handling
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
  } catch (error) {
    // Handle any other errors in the worker
    console.error("Worker error:", error);
    
    return new Response(
      JSON.stringify({
        response: "Sorry, I couldn't process your request right now. Please try again later."
      }),
      {
        status: 200, // Return 200 even on error
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
}
