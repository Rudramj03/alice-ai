import { useState } from "react";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceButton({ onResult }) {
  const [listening, setListening] = useState(false);

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setListening(false);
      onResult(transcript);
    };

    recognition.onerror = () => setListening(false);
  };

  return (
    <div
      className={`siri-mic ${listening ? "listening" : ""}`}
      onClick={startListening}
    >
      <div className="mic-core" />
      <div className="mic-ring" />
    </div>
  );
}
