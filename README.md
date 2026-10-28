# Commonweal — cweal.xyz

The public home of Commonweal: an open system for the common good.

A 25-page, responsive website with a searchable library of 18 founding documents, an interactive commonwealth model, three coordination examples, transparent governance and status, contribution pathways, and an eight-track original soundtrack. The site uses Commonweal’s red-and-gold identity, Keystone artwork, and Guild typeface.

## Run locally

Node.js 22 or newer. No package installation or runtime dependencies.

```sh
npm run build
npm start
```

Open http://localhost:8080. Set `PORT` to use another port. Rebuild after source edits.

```sh
npm test
```

The tests check all pages, internal links, fragment destinations, assets, search data, HTTP behavior, media byte ranges, and the healthcheck. GitHub Actions runs the build and tests on pushes and pull requests.

## Railway

The Dockerfile creates a small, non-root Node server. `railway.json` configures its healthcheck at `/health`. The server binds to `0.0.0.0` on Railway’s `PORT` (8080 locally). No environment secrets or database are required.

Connect `danecohn/cwealxyz`, branch `main`, to Railway. Attach `cweal.xyz` and use the exact DNS records Railway returns. The custom domain is not live until DNS and its certificate are verified. See `docs/deployment.md` for the provisioned service and DNS information.

## Project structure

- `src/templates.mjs`: page layouts and original website copy.
- `src/content.mjs`: resource catalogue and commonwealth descriptions.
- `src/style.css`: responsive design, glass surfaces, motion, and print styles.
- `src/app.js`: search, filtering, navigation, scenarios, motion preferences, and music controls.
- `src/markdown.mjs`: renderer for the project’s trusted, checked-in Markdown. Not a general-purpose untrusted-Markdown engine.
- `content/`: dated snapshot of the public Commonweal brain; provenance includes the exact source commit.
- `public/assets/`: published artwork, fonts, and MP3 files.
- `assets/src/` and `tools/`: preferred editable artwork/music/font sources and original generators.
- `scripts/build.mjs`: builds static HTML, the search index, and sitemap into ignored `dist/`.
- `server.mjs`: HTTP delivery, MIME types, cache validation, security headers, and media seeking.

The upstream [Commonweal brain](https://github.com/danecohn/Commonweal) remains the source of record. To update its published documents, review and copy the relevant source files into `content/`, update `content/provenance.json`, then rebuild and test. Do not silently rewrite the constitution or mandate in website copy.

The asset generators write into `assets/`. After regeneration, copy the intended web assets into `public/assets/`. Do not copy WAV masters to the website. Original source and generation details are documented in `tools/studio/README.md` and upstream.

## Design and privacy

The user-supplied iCloud web archive was inspected as a reference for surface layering, blur, transition timing, and motion. No Apple scripts, fonts, images, account data, or proprietary stylesheet bundles are distributed. See `docs/design-reference.md`.

Search runs locally in the browser. There are no accounts, forms, advertising trackers, or third-party analytics. Only the explicit reduced-motion preference is stored locally. Sound never autoplays. The site’s privacy page explains hosting and external-link considerations.

This is a public hub, not an administrative runtime. Examples are illustrative, the founding community registry is empty, and no administrative mandate exists. Contribution links open GitHub; they do not submit anything automatically.

## Browser QA

For a repeatable multi-width layout check, after building:

```sh
cp tests/browser-preview.html dist/qa.html
python3 -m http.server 8081 --bind 127.0.0.1 --directory dist
```

Open http://localhost:8081/qa.html. This local-only harness renders desktop and phone previews and checks nine representative pages at 390, 768, 1024, and 1440 pixels. It uses a separate local server because production intentionally prevents iframe embedding. Rebuild before publishing; the harness is never copied by the production build.

## Licence

Commonweal License 1.0 (`GPL-3.0-only`). See `LICENSE`, `LICENSING.md`, and the preserved font and soundtrack notices. Art made with Vigil Sprite; music made with Vigil Box.
