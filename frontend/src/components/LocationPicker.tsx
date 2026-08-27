import { useState } from "react";

export function LocationPicker({ onSelect }: { onSelect: (location: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <form
      className="location-picker"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSelect(value.trim());
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="City, district or coastal zone"
      />
      <button type="submit">Set</button>
    </form>
  );
}
