import { useState } from "react";
import { Input } from "@devalok/shilp-sutra/ui/input";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { IconMapPin } from "@tabler/icons-react";

export function LocationPicker({ onSelect, placeholder }: { onSelect: (location: string) => void; placeholder?: string }) {
  const [value, setValue] = useState("");
  return (
    <form
      style={{ display: "flex", gap: "0.5rem" }}
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSelect(value.trim());
      }}
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || "City, district or coastal zone"}
        startSection={<IconMapPin />}
        wrapperClassName="flex-1"
      />
      <Button type="submit" variant="soft">Set</Button>
    </form>
  );
}
