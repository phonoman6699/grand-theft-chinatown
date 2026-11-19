import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GrandTheftPizzo } from "./components/grand-theft-pizzo";
import "./styles.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <GrandTheftPizzo />
    </StrictMode>,
  );
}
