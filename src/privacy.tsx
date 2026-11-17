import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/site.css";
import { Privacy } from "./components/Privacy";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Privacy />
  </StrictMode>,
);
