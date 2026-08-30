import { useEffect } from "react";
import { IconButton } from "@devalok/shilp-sutra/ui/icon-button";
import { IconMicrophone, IconPlayerRecordFilled } from "@tabler/icons-react";
import { useVoiceRecorder } from "../../hooks/useVoiceRecorder";
import { useLangStore } from "../../stores/langStore";

const ERROR_MESSAGES: Record<string, string> = {
  denied: "Microphone permission denied",
  unsupported: "Voice input not supported in this browser",
  transcribe_failed: "Could not transcribe audio, try again",
};

export function VoiceButton({
  sessionId,
  onLiveText,
  onStatusChange,
  onSubmit,
}: {
  sessionId: string;
  onLiveText: (text: string) => void;
  onStatusChange?: (status: "idle" | "recording" | "processing") => void;
  onSubmit?: (text: string) => void;
}) {
  const lang = useLangStore((s) => s.lang);
  const { isRecording, isProcessing, start, stop, transcript, interimTranscript, error } =
    useVoiceRecorder(sessionId, lang);

  useEffect(() => {
    const combined = interimTranscript ? `${transcript} ${interimTranscript}`.trim() : transcript;
    if (combined) onLiveText(combined);
  }, [transcript, interimTranscript, onLiveText]);

  useEffect(() => {
    const status = isProcessing ? "processing" : isRecording ? "recording" : "idle";
    onStatusChange?.(status);
  }, [isRecording, isProcessing, onStatusChange]);

  if (typeof MediaRecorder === "undefined" && !(window as any).webkitSpeechRecognition && !(window as any).SpeechRecognition) return null;

  const state: "idle" | "recording" | "processing" = isProcessing ? "processing" : isRecording ? "recording" : "idle";

  const handleClick = () => {
    if (state === "recording") {
      stop();
      if (transcript.trim()) onSubmit?.(transcript.trim());
    } else if (state === "idle") {
      start();
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <IconButton
        icon={state === "recording" ? <IconPlayerRecordFilled /> : <IconMicrophone />}
        variant={state === "idle" ? "soft" : "solid"}
        color={state === "recording" ? "error" : state === "processing" ? "accent" : "neutral"}
        shape="circle"
        loading={state === "processing"}
        onClick={handleClick}
        aria-label="Voice input"
      />
      {error && <span className="voice-button__error">{ERROR_MESSAGES[error]}</span>}
    </div>
  );
}
