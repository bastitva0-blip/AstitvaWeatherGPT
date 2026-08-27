import { useVoiceRecorder } from "../hooks/useVoiceRecorder";

export function VoiceButton({
  sessionId,
  onTranscript,
}: {
  sessionId: string;
  onTranscript: (text: string, lang: string | null) => void;
}) {
  const { isRecording, start, stop, transcript, detectedLang } = useVoiceRecorder(sessionId);

  if (typeof MediaRecorder === "undefined") return null;

  const handleClick = async () => {
    if (isRecording) {
      stop();
      if (transcript) onTranscript(transcript, detectedLang);
    } else {
      await start();
    }
  };

  return (
    <button
      className={`voice-button ${isRecording ? "voice-button--recording" : ""}`}
      onClick={handleClick}
      aria-label="Voice input"
    >
      {isRecording ? "●" : "🎤"}
    </button>
  );
}
