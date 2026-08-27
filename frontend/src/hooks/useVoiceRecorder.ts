import { useCallback, useRef, useState } from "react";
import { transcribeVoice } from "../lib/api";

const MAX_SECONDS = 60;
const AUTO_STOP_WARN_SECONDS = 55;

export function useVoiceRecorder(sessionId: string, hintLang?: string) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
    chunksRef.current = [];
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const result = await transcribeVoice(blob, sessionId, hintLang);
      setTranscript(result.transcribed_text);
      setDetectedLang(result.detected_lang);
      stream.getTracks().forEach((t) => t.stop());
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

  return { isRecording, start, stop, transcript, detectedLang, MAX_SECONDS, AUTO_STOP_WARN_SECONDS };
}
