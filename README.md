# ohosdev

[![Site](https://img.shields.io/badge/site-ohosdev.com-blue)](https://ohosdev.com)

Public website for **[ohosdev.com](https://ohosdev.com)** — douya 🌱 的 AI HarmonyOS 开发日志。

Reference docs (the `/docs/` section) are auto-synced from the [`douya-labs/harmony-app-dev`](https://github.com/douya-labs/harmony-app-dev) AgentSkill. Insights, tips, showcase and the rest of the site live here.

Built with [Astro Starlight](https://starlight.astro.build/) + Tailwind + MDX + Pagefind. Fully static — deployed via Cloudflare Pages.

## Quick start

```bash
npm install              # one-time
npm run sync:refs        # pull references from harmony-app-dev → src/content/docs/{en,zh}/docs
npm run dev              # http://localhost:4321
npm run build            # outputs ./dist
npm run preview          # serve ./dist
```

### Reference sync

`npm run sync:refs` resolves the `references/` source dir in this order:

1. `$REFS_DIR` env var (absolute path)
2. `../harmony-app-dev/references` — sibling checkout (recommended for local dev)
3. `./references-cache/` — local cache
4. Otherwise: shallow-clone `douya-labs/harmony-app-dev` to `/tmp` and copy into `./references-cache/`

`references-cache/` is gitignored. Don't edit it — fix things upstream in [`harmony-app-dev/references/`](https://github.com/douya-labs/harmony-app-dev/tree/main/references) and re-sync.

## Project layout

```
ohosdev/
├── astro.config.mjs               # Starlight + Tailwind + sitemap
├── tailwind.config.mjs
├── scripts/
│   ├── sync-references.mjs        # cross-repo doc sync (see above)
│   ├── gen-favicons.mjs
│   └── gen-og.mjs
├── src/
│   ├── content/
│   │   └── docs/
│   │       ├── index.mdx          # English home (splash)
│   │       ├── about.md / privacy.md / terms.md / contact.md
│   │       ├── stories/           # launch stories
│   │       ├── tips/              # short dev tips
│   │       ├── showcase/          # API showcases
│   │       ├── tutorials/         # tutorials
│   │       ├── docs/              # reference (auto-synced)
│   │       └── zh/                # Chinese mirror of all of the above
│   ├── components/StarHead.astro  # injects hreflang + JSON-LD
│   └── pages/rss.xml.js           # /rss.xml (+ zh/rss.xml)
└── public/                        # robots.txt, favicon, og-image
```

## Translations

The `docs/` reference English version copies markdown verbatim. The Chinese version starts with a `:::caution[Translation pending]` banner and falls back to English. **Do not auto-translate** — translations are human-curated, submitted via PR to `src/content/docs/zh/docs/`.

## SEO

Out of the box:

- `sitemap-index.xml` via `@astrojs/sitemap`
- `robots.txt` in `public/`
- `/rss.xml` + `/zh/rss.xml`
- Meta tags + Starlight defaults
- Schema.org `TechArticle` + `BreadcrumbList` JSON-LD on doc pages
- `hreflang` alternates (`en`, `zh-CN`, `x-default`)

## Google AdSense

Opt-in via env var — nothing renders unless set:

```bash
PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
```

## Cloudflare Pages

- **Framework preset:** Astro
- **Build command:** `npm install && npm run sync:refs && npm run build`
- **Build output:** `dist`
- **Root directory:** *(blank)*
- **Node version:** `20`
- **Env vars:**
  - `PUBLIC_SITE_URL=https://ohosdev.com`
  - `PUBLIC_ADSENSE_CLIENT=...` (optional, only after AdSense approval)

Custom domain: add `ohosdev.com` to the Pages project and let Cloudflare provision the cert.

## Related

- 📚 **[douya-labs/harmony-app-dev](https://github.com/douya-labs/harmony-app-dev)** — the AgentSkill + reference markdown that powers `/docs/`
- 🌐 **[ohosdev.com](https://ohosdev.com)** — the live site

## License

MIT (site code). Reference content is sourced from `harmony-app-dev` under that repo's license.
