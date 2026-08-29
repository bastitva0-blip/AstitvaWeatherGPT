import { Popover, PopoverContent, PopoverTrigger } from "@devalok/shilp-sutra/ui/popover";
import { IconButton } from "@devalok/shilp-sutra/ui/icon-button";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { IconLayersIntersect } from "@tabler/icons-react";

export type MapLayer = "none" | "cloud" | "rain" | "wind" | "aqi" | "cyclone" | "coastal" | "satellite";

const LAYERS: { key: MapLayer; label: string }[] = [
  { key: "cloud", label: "☁ Cloud cover" },
  { key: "rain", label: "🌧 Rainfall radar" },
  { key: "wind", label: "💨 Wind speed" },
  { key: "aqi", label: "🌫 AQI overlay" },
  { key: "cyclone", label: "🌀 Cyclone tracks" },
  { key: "coastal", label: "🎣 Coastal fishing zones" },
  { key: "satellite", label: "🛰 Satellite (INSAT-3D)" },
];

export function LayerToggle({ active, onChange }: { active: MapLayer; onChange: (l: MapLayer) => void }) {
  return (
    <div className="layer-toggle">
      <Popover>
        <PopoverTrigger asChild>
          <IconButton icon={<IconLayersIntersect />} variant="solid" shape="circle" aria-label="Layers" />
        </PopoverTrigger>
        <PopoverContent align="end" style={{ minWidth: 220 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {LAYERS.map((l) => (
              <Button
                key={l.key}
                variant={active === l.key ? "soft" : "ghost"}
                color={active === l.key ? "accent" : "neutral"}
                style={{ justifyContent: "flex-start" }}
                onClick={() => onChange(active === l.key ? "none" : l.key)}
              >
                {l.label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
