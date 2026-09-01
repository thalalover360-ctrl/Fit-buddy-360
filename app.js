// Browser memory se key load karega ya pehli baar prompt mangega
let GEMINI_API_KEY = localStorage.getItem("gemini_key");

function checkApiKey() {
  if (!GEMINI_API_KEY) {
    GEMINI_API_KEY = prompt("Apni Gemini API Key enter karo (ye sirf aapke browser me save hogi):");
    if (GEMINI_API_KEY) {
      localStorage.setItem("gemini_key", GEMINI_API_KEY.trim());
    }
  }
}

// Fallback Model Pipeline
const AI_MODELS = [
  "gemini-3.6",
  "gemini-3.0-flash",
  "gemini-3",
  "gemini-2.5-flash",
  "gemini-1.5-flash"
];

const quotes = [
  "The pain you feel today will be the strength you feel tomorrow.",
  "Discipline is doing what needs to be done, even when you don't feel like it.",
  "Ek din me body nahi banti, par ek din zaroor banegi agar consistent rahoge.",
  "Never skip Monday. Set the standard for the rest of your week!",
  "Jab man na kare gym jane ka, wahi din sabse zyada count karta hai."
];

function getNewQuote() {
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById('motivation-quote').innerText = `"${random}"`;
}

function connectUser(name) {
  alert(`Request sent to ${name}! Wo aapke sath coordinate karega.`);
}

async function fetchFromAI(promptText) {
  checkApiKey();
  if (!GEMINI_API_KEY) {
    return "API Key missing hai! Page reload karke API Key enter karo.";
  }

  for (let model of AI_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text: `You are GymPulse AI, an energetic, friendly, and motivating gym partner and fitness coach. Reply in concise, high-energy Hinglish. User says: ${promptText}`
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const output = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (output) {
          const indicator = document.getElementById('model-indicator');
          if (indicator) indicator.innerText = model;
          return output;
        }
      }
    } catch (err) {
      console.warn(`Model ${model} connection issue, falling back to next...`);
    }
  }
  return "Bhai response nahi mila. Ek baar API key aur network check kar lo!";
}

async function sendMsg() {
  const input = document.getElementById('user-msg');
  const box = document.getElementById('chat-box');
  const userText = input.value.trim();

  if (!userText) return;

  // 1. User Message
  box.innerHTML += `
    <div class="p-2.5 bg-slate-800/80 border border-slate-700/60 rounded-lg text-slate-200 text-right">
      <span class="font-semibold text-slate-400 text-[11px] block">You</span>
      ${userText}
    </div>
  `;
  input.value = '';
  box.scrollTop = box.scrollHeight;

  // 2. Loading State
  const loadId = "loader-" + Date.now();
  box.innerHTML += `
    <div id="${loadId}" class="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-500 italic flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Coach soch raha hai...
    </div>
  `;
  box.scrollTop = box.scrollHeight;

  // 3. AI Fetch
  const aiReply = await fetchFromAI(userText);

  // 4. Update Chat
  const loaderElem = document.getElementById(loadId);
  if (loaderElem) loaderElem.remove();

  box.innerHTML += `
    <div class="p-2.5 bg-emerald-950/40 border border-emerald-800/50 rounded-lg text-emerald-200">
      <span class="font-bold text-emerald-400 text-[11px] block">Coach AI</span>
      ${aiReply}
    </div>
  `;
  box.scrollTop = box.scrollHeight;
}
