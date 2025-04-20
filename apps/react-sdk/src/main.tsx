import "virtual:uno.css";
import "@unocss/reset/tailwind.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.tsx";
import Provider from "./providers";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider
      appId={import.meta.env.VITE_APP_APP_ID}
      apiKey={import.meta.env.VITE_APP_API_KEY}
      baseURL={import.meta.env.VITE_APP_BASE_API_URL}
    >
      <App />
    </Provider>
  </StrictMode>
);
