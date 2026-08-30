import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./i18n";
import "./index.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/app.css";
import "./styles/landing.css";
import { LinkProvider } from "@devalok/shilp-sutra/shell/link-context";
import { Toaster } from "@devalok/shilp-sutra/ui/toaster";
import { RouterLink } from "./lib/RouterLink";
import { useLangStore } from "./stores/langStore";
import i18n from "./i18n";

function applyDocumentLang() {
  const lang = useLangStore.getState().lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  i18n.changeLanguage(lang);
}
applyDocumentLang();
useLangStore.subscribe(applyDocumentLang);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LinkProvider component={RouterLink}>
        <App />
        <Toaster />
      </LinkProvider>
    </BrowserRouter>
  </React.StrictMode>
);
