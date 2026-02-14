import React, { useState } from "react";
import Orb from "./Orb";
import "./App.css";

function App() {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [aiText, setAiText] = useState("");
  const [text, setText] = useState("");

  // ---------------- SPEAK (Text → Voice) ----------------
  const speak = (text) => {
  // Stop if already speaking
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = "en-US";
  utterance.rate = 0.92;   // softer, calmer
  utterance.pitch = 1.1;   // gentle warmth
  utterance.volume = 1;

  const voices = window.speechSynthesis.getVoices();

  // 🎤 Prefer Microsoft Zira (Windows warm female)
  const zira = voices.find(
    (v) =>
      v.name.toLowerCase().includes("zira") ||
      v.name.toLowerCase().includes("female")
  );

  if (zira) {
    utterance.voice = zira;
  }

  setSpeaking(true);

  utterance.onend = () => {
    setSpeaking(false);
  };

  window.speechSynthesis.speak(utterance);
};


  // ---------------- LISTEN (Voice → Text) ----------------
  const startListening = () => {
    // Stop speaking if active
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    setListening(true);
    recognition.start();

    recognition.onresult = async (event) => {
      const userText = event.results[0][0].transcript;
      setListening(false);
      if (handleLocalCommands(userText)) return;
      if (await handleWeatherCommand(userText)) return;


      try {
        const res = await fetch(
      "https://alice-backend-0vvw.onrender.com/chat",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: userText }),
  }
);

    const data = await res.json();
    setText(data.response);
    speak(data.response);

      } catch (err) {
        console.error(err);
      }
    };

    recognition.onerror = () => {
      setListening(false);
    };
  };

  // ---------------- BUTTON LOGIC ----------------
  const handleButtonClick = () => {
    if (speaking) {
      // Stop speaking
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    if (!listening) {
      startListening();
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="App">
      {/* AI Orb */}
      <Orb listening={listening} speaking={speaking} />

      {/* Assistant Name */}
      <h1 className={`alice-title ${speaking ? "speaking" : ""}`}>
    {"Alice".split("").map((char, i) => (
    <span
      key={i}
      className="alice-letter"
      style={{ animationDelay: `${i * 0.12}s` }}>
      {char}
    </span>
    ))}
      </h1>

      {/* Mic Button */}
      <button className="mic-button" onClick={handleButtonClick}>
        {listening
          ? "Listening…"
          : speaking
          ? "Speaking…"
          : "Tap to Speak"}
      </button>
    </div>
  );

  function handleLocalCommands(query) {
  const text = query.toLowerCase();

   // 👤 CREATOR COMMAND
  if (
    text.includes("who created you") ||
    text.includes("who made you") ||
    text.includes("your creator")
  ) {
    speak("Rudra Kumar Majhi is the creator of me.");
    return true;
  }

  //Puchu
  if (
    text.includes("who is puchu")
  ) {
    speak("Samanwita Basak urf puchu is a beautiful giri who is the love of Rudra's life");
    return true;
  }

  // TIME
  if (text.includes("time")) {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
    speak(`The time is ${time}`);
    return true;
  }

  // DATE
  if (text.includes("date") || text.includes("day")) {
    const date = new Date().toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    speak(`Today is ${date}`);
    return true;
  }

  return false;
}
//Weather Report
function extractCity(text) {
  text = text.toLowerCase();

  const patterns = [
    /weather in ([a-z\s]+)/,
    /temperature in ([a-z\s]+)/,
    /weather at ([a-z\s]+)/,
    /how is the weather in ([a-z\s]+)/,
    /in ([a-z\s]+)$/
  ];

  for (let pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1]
        .replace(/today|now|please|tell me/g, "")
        .trim()
        .replace(/\s+/g, " ");
    }
  }

  return null;
}

async function getWeather(city) {
  try {
    if (!city) {
      speak("Please tell me the city name.");
      return;
    }

    console.log("Fetching weather for:", city);

    const API_KEY = "71b5d098282ee516e728fa96f5dc5569"; // 🔴 CHECK THIS
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&units=metric&appid=${API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    console.log("Weather API response:", data);

    if (data.cod !== 200) {
      speak(`Sorry, I couldn't find weather for ${city}`);
      return;
    }

    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;

    speak(
      `The weather in ${city} is ${desc} with a temperature of ${temp} degrees Celsius`
    );
  } catch (err) {
    console.error(err);
    speak("Sorry, I couldn't fetch the weather right now.");
  }
}

async function handleWeatherCommand(query) {
  const text = query.toLowerCase();

  if (text.includes("weather") || text.includes("temperature")) {
    const city = extractCity(text);

    console.log("Detected city:", city);

    if (!city) {
      speak("Please tell me the city name");
      return true;
    }

    await getWeather(city);
    return true;
  }

  return false;
}
// ---------------- EXPORT ----------------
}

export default App;
