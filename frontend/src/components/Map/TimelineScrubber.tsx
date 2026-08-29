import { useEffect, useState } from "react";
import { IconButton } from "@devalok/shilp-sutra/ui/icon-button";
import { IconPlayerPlay, IconPlayerPause } from "@tabler/icons-react";

const MARKERS = [-6, -3, 0, 3, 6];

export function TimelineScrubber({ onTimeChange }: { onTimeChange?: (hourOffset: number) => void }) {
  const [index, setIndex] = useState(2);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    onTimeChange?.(MARKERS[index]);
  }, [index, onTimeChange]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % MARKERS.length), 1000);
    return () => clearInterval(t);
  }, [playing]);

  return (
    <div className="timeline-scrubber">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <IconButton
          icon={playing ? <IconPlayerPause /> : <IconPlayerPlay />}
          variant="ghost"
          onClick={() => setPlaying((p) => !p)}
          aria-label="Play/pause"
        />
        <div style={{ display: "flex", gap: "1rem" }}>
          {MARKERS.map((m, i) => (
            <button
              key={m}
              onClick={() => setIndex(i)}
              style={{ color: i === index ? "var(--teal)" : "var(--text-muted)", fontWeight: i === index ? 700 : 400 }}
            >
              {m === 0 ? "NOW" : `${m > 0 ? "+" : ""}${m}h`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
