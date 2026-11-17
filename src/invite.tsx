import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/site.css";
import { LangProvider } from "./i18n";
import { Invite } from "./components/Invite";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LangProvider>
      <Invite />
    </LangProvider>
  </StrictMode>,
);
