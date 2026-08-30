import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTitle } from "@devalok/shilp-sutra/ui/sheet";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { IconButton } from "@devalok/shilp-sutra/ui/icon-button";
import { Input } from "@devalok/shilp-sutra/ui/input";
import { EmptyState } from "@devalok/shilp-sutra/composed/empty-state";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { IconPencil, IconPlus, IconMapPin } from "@tabler/icons-react";
import { useCitiesStore, type SavedCity } from "../stores/citiesStore";

export function CitiesPage() {
  const { cities, addCity, removeCity, setActiveCity } = useCitiesStore();
  const [editMode, setEditMode] = useState(false);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

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
            <IconButton icon={<IconPencil />} variant="ghost" aria-label="Edit" onClick={() => setEditMode((e) => !e)} />
            <IconButton icon={<IconPlus />} variant="ghost" aria-label="Add" disabled={cities.length >= 5} onClick={() => setAdding(true)} />
          </>
        }
      />

      <Sheet open={adding} onOpenChange={setAdding}>
        <SheetContent side="bottom">
          <SheetTitle>Search for city weather</SheetTitle>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search for city weather" style={{ marginTop: "0.5rem" }} />
          <Button style={{ marginTop: "0.75rem" }} onClick={submitAdd}>Add</Button>
        </SheetContent>
      </Sheet>

      {cities.length >= 5 && <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Remove a city to add another (max 5)</p>}

      {cities.length === 0 ? (
        <EmptyState
          icon={<IconMapPin />}
          title="Add cities to track their weather"
          action={<Button onClick={() => setAdding(true)}>Add your first city</Button>}
        />
      ) : (
        <div style={{ marginTop: "1rem" }}>
          {cities.map((c: SavedCity) => (
            <div
              key={c.name}
              className="city-card fadeUp"
              style={{ backgroundImage: "url(https://source.unsplash.com/featured/?sunrise,clear,sky)", filter: "brightness(0.9)" }}
              onClick={() => { if (!editMode) { setActiveCity(c); navigate("/app"); } }}
            >
              <div className="city-card__content">
                <div className="city-card__row">
                  <span>{c.name} 📍</span>
                  {editMode ? (
                    <Button variant="ghost" color="error" size="sm" onClick={(e) => { e.stopPropagation(); removeCity(c.name); }}>Remove</Button>
                  ) : (
                    <span className="mono">N/A</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
