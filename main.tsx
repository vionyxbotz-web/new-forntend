import React from "react";
import ReactDOM from "react-dom/client";
import { useEffect } from "react";
import App from "./App";
import "./index.css";

// Viewport height fix for mobile browsers
function setVH() {
  const vh = window.innerHeight * 0.01;
  const vw = window.innerWidth * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  document.documentElement.style.setProperty('--vw', `${vw}px`);
}

// Set initial viewport height
setVH();

// Update viewport height when window resizes (address bar changes)
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
