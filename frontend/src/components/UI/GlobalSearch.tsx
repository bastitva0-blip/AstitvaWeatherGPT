import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTitle } from "@devalok/shilp-sutra/ui/sheet";
import { IconSearch, IconMapPin, IconArrowRight } from "@tabler/icons-react";
import { useCitiesStore } from "../../stores/citiesStore";
import { fetchLiveWeather } from "../../lib/api";

interface SearchResult {
  name: string;
  lat: number;
  lon: number;
  temp?: number;
  condition?: string;
}

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const setActiveCity = useCitiesStore((s) => s.setActiveCity);
  const addCity = useCitiesStore((s) => s.addCity);

  // focus input when sheet opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setQuery("");
      setResults([]);
    }
  }, [open]);

  // debounced search
  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // Use Nominatim for geocoding suggestions, then fetch weather
        const geo = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=in&limit=5&format=json`
        ).then((r) => r.json());
        const items: SearchResult[] = geo.map((g: any) => ({
          name: g.display_name.split(",").slice(0, 2).join(", "),
          lat: parseFloat(g.lat),
          lon: parseFloat(g.lon),
        }));
        setResults(items);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(r: SearchResult) {
    setActiveCity({ name: r.name, lat: r.lat, lon: r.lon, addedAt: new Date().toISOString() });
    navigate("/app");
    onClose();
  }

  function handleSave(e: React.MouseEvent, r: SearchResult) {
    e.stopPropagation();
    addCity({ name: r.name, lat: r.lat, lon: r.lon, addedAt: new Date().toISOString() });
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" style={{ maxHeight: "80vh" }}>
        <SheetTitle>Search location</SheetTitle>

        {/* Search input */}
        <div className="gsearch__input-wrap">
          <IconSearch size={16} className="gsearch__icon" aria-hidden="true" />
          <input
            ref={inputRef}
            className="gsearch__input"
            placeholder="Search city or district in India..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search location"
            autoComplete="off"
          />
          {loading && <span className="gsearch__spinner" aria-label="Searching..." />}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="gsearch__results" role="listbox" aria-label="Search results">
            {results.map((r) => (
              <li
                key={`${r.lat}-${r.lon}`}
                className="gsearch__result"
                role="option"
                aria-selected="false"
                onClick={() => handleSelect(r)}
              >
                <div className="gsearch__result-left">
                  <IconMapPin size={14} aria-hidden="true" style={{ color: "var(--teal)", flexShrink: 0 }} />
                  <div>
                    <div className="gsearch__result-name">{r.name}</div>
                    {r.temp != null && (
                      <div className="gsearch__result-meta">{r.temp}°C · {r.condition}</div>
                    )}
                  </div>
                </div>
                <div className="gsearch__result-actions">
                  <button
                    className="gsearch__save"
                    onClick={(e) => handleSave(e, r)}
                    aria-label={`Save ${r.name}`}
                  >
                    + Save
                  </button>
                  <IconArrowRight size={14} aria-hidden="true" style={{ color: "var(--muted)" }} />
                </div>
              </li>
            ))}
          </ul>
        )}

        {query.length >= 2 && !loading && results.length === 0 && (
          <p className="gsearch__empty">No locations found for "{query}"</p>
        )}
      </SheetContent>
    </Sheet>
  );
}
