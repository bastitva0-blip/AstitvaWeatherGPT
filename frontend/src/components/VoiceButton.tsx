import { useEffect, useRef } from "react";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";

const ERROR_MESSAGES: Record<string, string> = {
  denied: "Microphone permission denied",
  unsupported: "Voice input not supported in this browser",
  transcribe_failed: "Could not transcribe audio — try again",
};

export function VoiceButton({
  sessionId,
  onLiveText,
  onStatusChange,
}: {
  sessionId: string;
  onLiveText: (text: string) => void;
  onStatusChange?: (status: "idle" | "recording" | "processing") => void;
}) {
  const { isRecording, isProcessing, start, stop, transcript, interimTranscript, error } =
    useVoiceRecorder(sessionId);

  // Live-update the input box as the user speaks (Web Speech path streams
  // interim results continuously) rather than only filling it once at the
  // very end — this is what "shows the text in the bar as I speak" means.
  useEffect(() => {
    const combined = interimTranscript ? `${transcript} ${interimTranscript}`.trim() : transcript;
    if (combined) onLiveText(combined);
  }, [transcript, interimTranscript, onLiveText]);

  useEffect(() => {
    onStatusChange?.(isProcessing ? "processing" : isRecording ? "recording" : "idle");
  }, [isRecording, isProcessing, onStatusChange]);

  if (typeof MediaRecorder === "undefined" && !(window as any).webkitSpeechRecognition) return null;

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
