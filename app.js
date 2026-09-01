// LocalStorage se friends load ya default set
let friends = JSON.parse(localStorage.getItem("gym_friends")) || [
  { name: "Mera Gym Buddy", time: "6:00 AM", gym: "Main Gym" }
];

function renderFriends() {
  const container = document.getElementById("friends-list");
  if (!container) return;

  if (friends.length === 0) {
    container.innerHTML = `
      <div class="p-4 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
        Abhi koi dost add nahi hai. "+ Add Friend" dabao ya link share karo!
      </div>
    `;
    return;
  }

  container.innerHTML = friends.map((f, index) => `
    <div class="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-sm uppercase">
          ${f.name.charAt(0)}
        </div>
        <div>
          <h3 class="font-semibold text-xs text-slate-100">${f.name}</h3>
          <p class="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
            <i class="fa-solid fa-clock text-[10px] text-emerald-400"></i> ${f.time} • ${f.gym}
          </p>
        </div>
      </div>
      <button onclick="removeFriend(${index})" class="text-slate-500 hover:text-red-400 text-xs px-2 py-1">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `).join('');
}

function openAddFriendModal() {
  const name = prompt("Dost ka naam:");
  if (!name) return;
  const time = prompt("Gym ka timing (e.g. 6:00 AM / 7:00 PM):") || "6:00 AM";
  const gym = prompt("Gym ka naam / area:") || "Gym";

  friends.push({ name, time, gym });
  localStorage.setItem("gym_friends", JSON.stringify(friends));
  renderFriends();
}

function removeFriend(index) {
  if (confirm("Dost ko list se hatana hai?")) {
    friends.splice(index, 1);
    localStorage.setItem("gym_friends", JSON.stringify(friends));
    renderFriends();
  }
}

function shareSquad() {
  const text = encodeURIComponent("Bhai GymPulse par connect karte hain, workout routine sync karenge! Saath me gym chalte hain.");
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
}

function changeApiKey() {
  const current = localStorage.getItem("gemini_key") || "";
  const newKey = prompt("Apni Gemini API Key enter karo:", current);
  if (newKey !== null) {
    localStorage.setItem("gemini_key", newKey.trim());
    alert("Key updated!");
  }
}

// AI Chatbot with Offline/Fallback Smart Answers
const AI_MODELS = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

const quotes = [
  "The pain you feel today will be the strength you feel tomorrow.",
  "Discipline is doing what needs to be done, even when you don't feel like it.",
  "Ek din me body nahi banti, par consistency se 100% banti hai.",
  "Never skip a workout just because of laziness. 20 min hi karo par jao!",
  "Mindset over mood. Utho aur push karo!"
];

function getNewQuote() {
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById('motivation-quote').innerText = `"${random}"`;
}

// Agar API na chale toh smart coach offline logic
function getFallbackResponse(query) {
  const q = query.toLowerCase();
  if (q.includes("thak") || q.includes("tired")) {
    return "Thakawat natural hai bhai! Thoda paani piyo, 5 min deep breathing karo. Agar bohot tired ho toh rest day lo, warna light stretching aur walking se blood flow badhao!";
  } else if (q.includes("gym") || q.includes("workout")) {
    return "Bas shoes pehno aur nikal pado! Starting ke 5 minutes mushkil lagte hain, uske baad momentum apne aap ban jata hai.";
  } else if (q.includes("diet") || q.includes("protein")) {
    return "Pre-workout me ek banana ya black coffee le lo, aur post-workout me protein + complex carbs (eggs, paneer, oats) maintain rakho.";
  }
  return "Consistently lage raho bhai! Chahe padhai ho ya gym, jab daily discipline banate ho toh results apne aap aate hain. Push hard!";
}

async function fetchFromAI(promptText) {
  const key = localStorage.getItem("gemini_key");

  // Agar key nahi hai toh direct fallback response dega
  if (!key) {
    document.getElementById('model-indicator').innerText = "Offline Coach";
    return getFallbackResponse(promptText);
  }

  for (let model of AI_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: `Act as GymPulse AI coach. Reply in energetic, concise Hinglish: ${promptText}` }]
          }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          document.getElementById('model-indicator').innerText = model;
          return text;
        }
      }
    } catch (e) {
      console.warn(`Model ${model} issue`);
    }
  }

  // API error aane par bhi offline answer se respond karega
  document.getElementById('model-indicator').innerText = "Coach";
  return getFallbackResponse(promptText);
}

async function sendMsg() {
  const input = document.getElementById('user-msg');
  const box = document.getElementById('chat-box');
  const userText = input.value.trim();
  if (!userText) return;

  box.innerHTML += `
    <div class="p-2.5 bg-slate-800/80 border border-slate-700/60 rounded-lg text-slate-200 text-right">
      <span class="font-semibold text-slate-400 text-[11px] block">You</span>
      ${userText}
    </div>
  `;
  input.value = '';
  box.scrollTop = box.scrollHeight;

  const loadId = "load-" + Date.now();
  box.innerHTML += `
    <div id="${loadId}" class="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-500 italic flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Coach soch raha hai...
    </div>
  `;
  box.scrollTop = box.scrollHeight;

  const reply = await fetchFromAI(userText);

  const loader = document.getElementById(loadId);
  if (loader) loader.remove();

  box.innerHTML += `
    <div class="p-2.5 bg-emerald-950/40 border border-emerald-800/50 rounded-lg text-emerald-200">
      <span class="font-bold text-emerald-400 text-[11px] block">Coach AI</span>
      ${reply}
    </div>
  `;
  box.scrollTop = box.scrollHeight;
}

// Initial render
window.onload = () => {
  renderFriends();
};

