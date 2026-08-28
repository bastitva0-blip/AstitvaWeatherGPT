import { useCallback, useRef, useState } from "react";
import { transcribeVoice } from "../lib/api";

const MAX_SECONDS = 60;
const AUTO_STOP_WARN_SECONDS = 55;

export function useVoiceRecorder(sessionId: string, hintLang?: string) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [error, setError] = useState<"denied" | "unsupported" | "transcribe_failed" | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("unsupported");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      // Mic permission denied, or no microphone device available — without
      // this catch the promise rejection was silent: the button just did
      // nothing and the user had no idea why (found via live testing).
      setError("denied");
      return;
    }

    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
    chunksRef.current = [];
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      try {
        const result = await transcribeVoice(blob, sessionId, hintLang);
        setTranscript(result.transcribed_text);
        setDetectedLang(result.detected_lang);
      } catch {
        setError("transcribe_failed");
      } finally {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);

    timerRef.current = setTimeout(() => stop(), MAX_SECONDS * 1000);
  }, [sessionId, hintLang]);

  const stop = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { isRecording, start, stop, transcript, detectedLang, error, MAX_SECONDS, AUTO_STOP_WARN_SECONDS };
}
