import { create } from "zustand";

export interface SavedCity {
  name: string;
  lat: number;
  lon: number;
  addedAt: string;
}

interface CitiesState {
  cities: SavedCity[];
  activeCity: SavedCity | null;
  addCity: (city: SavedCity) => void;
  removeCity: (name: string) => void;
  setActiveCity: (city: SavedCity) => void;
  reorder: (cities: SavedCity[]) => void;
}

export const useCitiesStore = create<CitiesState>((set, get) => ({
  cities: JSON.parse(localStorage.getItem("wgpt_cities") || "[]"),
  activeCity: null,
  addCity: (city) => {
    if (get().cities.length >= 5) return;
    const cities = [...get().cities, city];
    localStorage.setItem("wgpt_cities", JSON.stringify(cities));
    set({ cities });
  },
  removeCity: (name) => {
    const cities = get().cities.filter((c) => c.name !== name);
    localStorage.setItem("wgpt_cities", JSON.stringify(cities));
    set({ cities });
  },
  setActiveCity: (city) => set({ activeCity: city }),
  reorder: (cities) => {
    localStorage.setItem("wgpt_cities", JSON.stringify(cities));
    set({ cities });
  },
}));
