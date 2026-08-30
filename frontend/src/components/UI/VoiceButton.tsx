import { useEffect, useRef } from "react";
import { IconMicrophone, IconPlayerRecordFilled } from "@tabler/icons-react";
import { useVoiceRecorder } from "../../hooks/useVoiceRecorder";
import { useLangStore } from "../../stores/langStore";

// CHANGE 6: Active waveform + glowing ring around mic during recording.
// Three states:
//   idle       → gray ghost mic button
//   recording  → red pulse ring + animated waveform bars inside button
//   processing → teal spinner ring

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    const combined = interimTranscript ? `${transcript} ${interimTranscript}`.trim() : transcript;
    if (combined) onLiveText(combined);
  }, [transcript, interimTranscript, onLiveText]);

  const state: "idle" | "recording" | "processing" =
    isProcessing ? "processing" : isRecording ? "recording" : "idle";

  useEffect(() => {
    onStatusChange?.(state);
  }, [state, onStatusChange]);

  // Waveform animation while recording
  useEffect(() => {
    if (state !== "recording") {
      cancelAnimationFrame(animRef.current);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const BAR_COUNT = 5;
    let phase = 0;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const W = canvas.width;
      const H = canvas.height;
      const barW = 3;
      const gap = (W - BAR_COUNT * barW) / (BAR_COUNT + 1);
      for (let i = 0; i < BAR_COUNT; i++) {
        const x = gap + i * (barW + gap);
        const amp = 0.3 + 0.7 * Math.abs(Math.sin(phase + i * 0.8));
        const barH = Math.max(4, amp * (H * 0.8));
        const y = (H - barH) / 2;
        ctx.fillStyle = "#FF4444";
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, 2);
        ctx.fill();
      }
      phase += 0.12;
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [state]);

  if (
    typeof MediaRecorder === "undefined" &&
    !(window as any).webkitSpeechRecognition &&
    !(window as any).SpeechRecognition
  ) return null;

  const handleClick = () => {
    if (state === "recording") {
      stop();
      if (transcript.trim()) onSubmit?.(transcript.trim());
    } else if (state === "idle") {
      start();
    }
  };

  return (
    <div className="voice-btn-wrap" aria-live="polite">
      {/* Outer pulse ring — only in recording state */}
      <div
        className={`voice-btn__ring ${state === "recording" ? "voice-btn__ring--active" : ""}`}
        aria-hidden="true"
      />

      <button
        className={`voice-btn voice-btn--${state}`}
        onClick={handleClick}
        aria-label={
          state === "recording"
            ? "Stop recording"
            : state === "processing"
            ? "Processing voice…"
            : "Start voice input"
        }
        disabled={state === "processing"}
        type="button"
      >
        {state === "recording" ? (
          // Waveform inside button while recording
          <canvas
            ref={canvasRef}
            width={36}
            height={24}
            className="voice-btn__canvas"
            aria-hidden="true"
          />
        ) : state === "processing" ? (
          <span className="voice-btn__spinner" aria-hidden="true" />
        ) : (
          <IconMicrophone size={20} aria-hidden="true" />
        )}
      </button>

      {error && (
        <span className="voice-btn__error" role="alert">
          {ERROR_MESSAGES[error] ?? error}
        </span>
      )}
    </div>
  );
}
