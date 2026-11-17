import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/site.css";
import { LangProvider } from "./i18n";
import { Home } from "./components/Home";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LangProvider>
      <Home />
    </LangProvider>
  </StrictMode>,
);
