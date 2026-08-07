import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootEl = document.getElementById('root')!;
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Production builds ship prerendered HTML inside #root (see prerender.mjs);
// hydrate it so React attaches without re-rendering. Dev serves an empty root.
if (rootEl.hasChildNodes()) {
  try {
    hydrateRoot(rootEl, app);
  } catch {
    rootEl.innerHTML = '';
    createRoot(rootEl).render(app);
  }
} else {
  createRoot(rootEl).render(app);
}
