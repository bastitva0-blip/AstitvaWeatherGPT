import { useEffect, useRef } from "react";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";

const ERROR_MESSAGES: Record<string, string> = {
  denied: "Microphone permission denied",
  unsupported: "Voice input not supported in this browser",
  transcribe_failed: "Could not transcribe audio — try again",
};

export function VoiceButton({
  sessionId,
  onTranscript,
}: {
  sessionId: string;
  onTranscript: (text: string, lang: string | null) => void;
}) {
  const { isRecording, start, stop, transcript, detectedLang, error } = useVoiceRecorder(sessionId);
  const lastHandledTranscript = useRef<string | null>(null);

  // transcript arrives asynchronously (after the network round trip to
  // /api/nlp/voice, which completes well after stop() returns) — reading it
  // synchronously right after calling stop() always saw the stale
  // pre-recording value. Firing on the transcript state change instead is
  // what actually works.
  useEffect(() => {
    if (transcript && transcript !== lastHandledTranscript.current) {
      lastHandledTranscript.current = transcript;
      onTranscript(transcript, detectedLang);
    }
  }, [transcript, detectedLang, onTranscript]);

  if (typeof MediaRecorder === "undefined") return null;

  const handleClick = () => {
    if (isRecording) {
      stop();
    } else {
      start();
    }
  };

  return (
    <div className="voice-button-wrap">
      <button
        className={`voice-button ${isRecording ? "voice-button--recording" : ""}`}
        onClick={handleClick}
        aria-label="Voice input"
      >
        {isRecording ? "●" : "🎤"}
      </button>
      {error && <span className="voice-button__error">{ERROR_MESSAGES[error]}</span>}
    </div>
  );
}
