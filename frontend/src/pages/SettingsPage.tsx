import { LanguageSelect } from "../components/LanguageSelect";

export function SettingsPage() {
  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <label>
        Language
        <LanguageSelect />
      </label>
    </div>
  );
}
