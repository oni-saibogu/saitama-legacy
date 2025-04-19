import "virtual:uno.css";
import "@unocss/reset/tailwind.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.tsx";
import APIProvider from "./providers/APIProvider.tsx";
import StoreProvider from "./providers/StoreProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <APIProvider
        baseURL=""
        apiKey=""
        appId=""
      >
        <App />
      </APIProvider>
    </StoreProvider>
  </StrictMode>
);
