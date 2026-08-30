import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTitle } from "@devalok/shilp-sutra/ui/sheet";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { IconButton } from "@devalok/shilp-sutra/ui/icon-button";
import { Input } from "@devalok/shilp-sutra/ui/input";
import { Skeleton } from "@devalok/shilp-sutra/ui/skeleton";
import { EmptyState } from "@devalok/shilp-sutra/composed/empty-state";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { IconPencil, IconPlus, IconMapPin, IconRefresh } from "@tabler/icons-react";
import { useCitiesStore, type SavedCity } from "../stores/citiesStore";
import { fetchLiveWeather } from "../lib/api";

// CHANGE 5 (Cities): Shimmer skeleton while fetching, no "N/A" text.
// Each card loads temp + condition independently so partial data shows fast.
// On fetch failure: fall back to last cached reading if one exists,
// otherwise show a retry button instead of "N/A".

interface CityWeather { temp: number; condition: string; loading: boolean; error: boolean; stale: boolean }
interface CachedReading { temp: number; condition: string }

function cacheKey(name: string) { return `wgpt_city_weather_${name}`; }

function readCache(name: string): CachedReading | null {
  const raw = localStorage.getItem(cacheKey(name));
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function writeCache(name: string, data: CachedReading) {
  localStorage.setItem(cacheKey(name), JSON.stringify(data));
}

function useCityWeather(cities: SavedCity[]) {
  const [weather, setWeather] = useState<Record<string, CityWeather>>({});

  const fetchOne = useCallback((name: string) => {
    setWeather((prev) => ({ ...prev, [name]: { ...(prev[name] ?? { temp: 0, condition: "", stale: false }), loading: true, error: false } }));
    fetchLiveWeather(name)
      .then((d) => {
        const data: CachedReading = { temp: Math.round((d.temperature_max + d.temperature_min) / 2), condition: d.condition };
        writeCache(name, data);
        setWeather((prev) => ({ ...prev, [name]: { ...data, loading: false, error: false, stale: false } }));
      })
      .catch(() => {
        const cached = readCache(name);
        setWeather((prev) => ({
          ...prev,
          [name]: cached
            ? { ...cached, loading: false, error: false, stale: true }
            : { temp: 0, condition: "", loading: false, error: true, stale: false },
        }));
      });
  }, []);

  useEffect(() => {
    const init: Record<string, CityWeather> = {};
    cities.forEach((c) => {
      const cached = readCache(c.name);
      init[c.name] = cached
        ? { ...cached, loading: true, error: false, stale: true }
        : { temp: 0, condition: "", loading: true, error: false, stale: false };
    });
    setWeather(init);
    cities.forEach((c) => fetchOne(c.name));
  }, [cities.map((c) => c.name).join(",")]);

  return { weather, retry: fetchOne };
}

// Background gradient per condition
function conditionGradient(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes("rain") || c.includes("shower") || c.includes("drizzle"))
    return "linear-gradient(135deg,#071A2B,#0D3050)";
  if (c.includes("storm") || c.includes("thunder"))
    return "linear-gradient(135deg,#0D1020,#1A1040)";
  if (c.includes("cloud") || c.includes("overcast"))
    return "linear-gradient(135deg,#071A2B,#0D2640)";
  if (c.includes("fog") || c.includes("mist") || c.includes("haze"))
    return "linear-gradient(135deg,#0D2030,#1A3040)";
  if (c.includes("sun") || c.includes("clear"))
    return "linear-gradient(135deg,#0A1020,#1A3520)";
  return "linear-gradient(135deg,#020B14,#0D2640)";
}

export function CitiesPage() {
  const { cities, addCity, removeCity, setActiveCity } = useCitiesStore();
  const [editMode, setEditMode] = useState(false);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { weather, retry } = useCityWeather(cities);

  function submitAdd() {
    if (!search.trim()) return;
    addCity({ name: search.trim(), lat: 0, lon: 0, addedAt: new Date().toISOString() });
    setSearch("");
    setAdding(false);
  }

  return (
    <div style={{ padding: "1rem" }}>
      <PageHeader
        title="My Cities"
        actions={
          <>
            <IconButton
              icon={<IconPencil />}
              variant={editMode ? "solid" : "ghost"}
              color={editMode ? "accent" : "neutral"}
              aria-label="Edit"
              onClick={() => setEditMode((e) => !e)}
            />
            <IconButton
              icon={<IconPlus />}
              variant="ghost"
              aria-label="Add city"
              disabled={cities.length >= 5}
              onClick={() => setAdding(true)}
            />
          </>
        }
      />

      <Sheet open={adding} onOpenChange={setAdding}>
        <SheetContent side="bottom">
          <SheetTitle>Search for city weather</SheetTitle>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitAdd()}
            placeholder="e.g. Bhubaneswar, Surat, Mangalore"
            style={{ marginTop: "0.5rem" }}
            autoFocus
          />
          <Button style={{ marginTop: "0.75rem" }} onClick={submitAdd} disabled={!search.trim()}>
            Add
          </Button>
        </SheetContent>
      </Sheet>

      {cities.length >= 5 && (
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
          Remove a city to add another (max 5)
        </p>
      )}

      {cities.length === 0 ? (
        <EmptyState
          icon={<IconMapPin />}
          title="Add cities to track their weather"
          action={<Button onClick={() => setAdding(true)}>Add your first city</Button>}
        />
      ) : (
        <div className="city-list" style={{ marginTop: "1rem" }}>
          {cities.map((c: SavedCity) => {
            const w = weather[c.name];
            const isLoading = !w || w.loading;
            const isError = !!w && !w.loading && w.error;
            const bg = isLoading || isError ? "linear-gradient(135deg,#020B14,#0D2640)" : conditionGradient(w.condition);

            return (
              <div
                key={c.name}
                className="city-card"
                style={{ backgroundImage: bg, cursor: editMode ? "default" : "pointer" }}
                onClick={() => {
                  if (!editMode) {
                    setActiveCity(c);
                    navigate("/app");
                  }
                }}
                role={editMode ? undefined : "button"}
                aria-label={editMode ? undefined : `View weather for ${c.name}`}
              >
                <div className="city-card__content">
                  <div className="city-card__row">
                    {/* Left: city name + condition skeleton */}
                    <div>
                      <div className="city-card__name">
                        {c.name}
                        {!editMode && <IconMapPin size={13} style={{ marginLeft: 5, color: "var(--teal)", verticalAlign: -1 }} aria-hidden="true" />}
                      </div>
                      {isLoading ? (
                        <Skeleton style={{ width: 80, height: 12, marginTop: 4, borderRadius: 4 }} />
                      ) : isError ? (
                        <div className="city-card__condition">Couldn't fetch data</div>
                      ) : (
                        <div className="city-card__condition">
                          {w.condition}
                          {w.stale && <span style={{ opacity: 0.6 }}> · cached</span>}
                        </div>
                      )}
                    </div>

                    {/* Right: temperature, remove button, or retry */}
                    {editMode ? (
                      <Button
                        variant="ghost"
                        color="error"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); removeCity(c.name); }}
                      >
                        Remove
                      </Button>
                    ) : isLoading ? (
                      <Skeleton style={{ width: 48, height: 28, borderRadius: 4 }} />
                    ) : isError ? (
                      <IconButton
                        icon={<IconRefresh />}
                        variant="ghost"
                        aria-label={`Retry fetching weather for ${c.name}`}
                        onClick={(e) => { e.stopPropagation(); retry(c.name); }}
                      />
                    ) : (
                      <div className="city-card__temp mono">
                        {w.temp}°
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
