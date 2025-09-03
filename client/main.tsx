import "./global.css";
import React from "react";
import { createRoot, type Root } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root")!;
const existing = (container as any)._reactRoot as Root | undefined;
const root = existing || createRoot(container);
(container as any)._reactRoot = root;
root.render(<App />);
