# CampConnect PWA

Files:
- `index.html`
- `manifest.json`
- `service-worker.js`
- `icon.svg`

## Test locally
A service worker will not run when opening `index.html` directly from Files/Downloads.
Use a local web server instead:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Deploy
Upload this folder to Netlify, Vercel, GitHub Pages, or any HTTPS web host.

## Install
- Android Chrome: open HTTPS URL, use Install App or Add to Home Screen.
- iPhone Safari: open HTTPS URL, Share → Add to Home Screen.
