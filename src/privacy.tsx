import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/site.css";
import { LangProvider } from "./i18n";
import { Privacy } from "./components/Privacy";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LangProvider>
      <Privacy />
    </LangProvider>
  </StrictMode>,
);
