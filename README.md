# Mohammad Nekookar — Personal Website

Personal portfolio of **Mohammad Nekookar** — Naval Architect & Marine Systems Designer.
Apple-inspired design · IRANYekan typography · WebGL 3D background (Three.js) · zero build step.

## Stack

- Pure HTML / CSS / vanilla JS — no framework, no bundler
- [Three.js](https://threejs.org) (CDN) for the interactive particle/geometry background
- Local **IRANYekan** web fonts (`fonts/`) — regular, medium, bold
- FontAwesome icons via CDN

## Structure

```
├── index.html                     # single-page site (all sections)
├── style.css                      # design system, themes, responsive
├── script.js                      # theme, menu, reveal animations, modal, form
├── three-bg.js                    # WebGL background scene
├── fonts/                         # IRANYekan woff files
├── logo.png                       # brand mark / favicon
└── mohammad_nekookar_resume.pdf   # downloadable résumé
```

## Run locally

Just open `index.html`, or serve it:

```bash
python -m http.server 8000
# → http://localhost:8000
```

## Deploy on GitHub Pages (custom domain)

1. Push this folder to a repository (e.g. `<username>/<username>.github.io` or any repo).
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / root.
3. The included `CNAME` file points to `nekookar.ir` — edit or remove it if your domain differs.
4. At your DNS provider add:
   - Apex: `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - www: `CNAME` → `<username>.github.io`
5. Enable **Enforce HTTPS** once the certificate is issued.

## Notes

- Contact form uses [Web3Forms](https://web3forms.com) — replace the `access_key` in `index.html` with your own key.
- Certificates open from Google Drive links via an in-page modal viewer.
