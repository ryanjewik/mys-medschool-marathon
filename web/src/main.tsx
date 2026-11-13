import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/fredoka";
import "@fontsource-variable/nunito";
import App from "./App";
import { LockGate } from "./components/LockScreen";
import "./style.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LockGate>
      <App />
    </LockGate>
  </StrictMode>,
);
