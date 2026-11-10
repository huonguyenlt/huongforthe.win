# Huong's Blog

I keep my thoughts here.

## Local development

This project requires Node.js 22.23.4 or newer.

```sh
npm install
npm run dev -- --background
```

Use `npm run astro -- dev status`, `npm run astro -- dev logs`, and
`npm run astro -- dev stop` to manage the development server. To type-check,
build, and generate the search index, run `npm run build`. Each build replaces
the old search files so removed posts do not remain in the index.
Run `npm test` to check the search-index cleanup.
Astro may warn that the posts collection is empty until a post is added.

## Personalizing the blog

- Update the title, description, author, and time zone in
  [`astro-paper.config.ts`](./astro-paper.config.ts).
- Before deploying, replace `site.url` with the public blog URL. Until then,
  canonical links, the RSS feed, the sitemap, and social metadata use
  `http://localhost:4321/`.
- Add profile URLs to the `socials` entries in
  [`astro-paper.config.ts`](./astro-paper.config.ts). Leave a URL empty to keep
  its icon visible but inactive. Email links use the `mailto:` prefix.
- Edit [`src/content/pages/about.md`](./src/content/pages/about.md) to update
  the About page. Social preview images are generated from the site title and
  description unless a custom `site.ogImage` is provided.
- Edit the greeting and intro directly in
  [`src/pages/index.astro`](./src/pages/index.astro). They are separate from
  `site.description`, which is used for metadata, preview images, and RSS.
- Set `features.showArchives` to `true` to restore the Archives page and its
  navigation link.

## Adding posts

Add a Markdown or MDX file under [`src/content/posts/`](./src/content/posts/).
For example:

```md
---
title: "My first post"
pubDatetime: 2026-01-01T00:00:00Z
description: "A short summary of the post."
---

Write the post here.
```

The author defaults to the name in the site configuration. Posts can also have
tags, a `draft: true` flag, and other metadata. See the
[AstroPaper documentation](https://github.com/satnaing/astro-paper#readme) for
more options.

## Credits

Built with [AstroPaper](https://github.com/satnaing/astro-paper), created by
Sat Naing and contributors. See [LICENSE](./LICENSE) for the original MIT
license.
