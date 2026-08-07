// Injecteert de server-gerenderde App in dist/index.html na `vite build`.
// Draait als laatste stap van `npm run build` — geen headless browser nodig.
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { render } from './dist-ssr/entry-server.js';

const htmlPath = 'dist/index.html';
const html = readFileSync(htmlPath, 'utf8');
const appHtml = render();

const marker = '<div id="root"></div>';
if (!html.includes(marker)) {
  throw new Error(`Prerender: marker ${marker} niet gevonden in ${htmlPath}`);
}
writeFileSync(htmlPath, html.replace(marker, `<div id="root">${appHtml}</div>`));
rmSync('dist-ssr', { recursive: true, force: true });
console.log(`Prerender OK: ${(appHtml.length / 1024).toFixed(0)} kB app-HTML in ${htmlPath}`);
