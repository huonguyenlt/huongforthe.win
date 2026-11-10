## Project status

Personal blog for Huong Nguyen, built on the AstroPaper theme. Keep this list
current: remove items once they are done.

- Done: removed all AstroPaper demo posts, images, and original-owner details.
  Site info is in `astro-paper.config.ts` (title "Huong's Blog", timezone
  `Asia/Ho_Chi_Minh`). The homepage heading is a greeting, not the site title.
  Footer shows only social icons (copyright text removed on purpose).
- Done: social icons with an empty `url` render dimmed and unclickable
  (`src/components/Socials.astro`). Empty-state messages appear when there are
  no posts or tags.
- To do: add social profile URLs in `astro-paper.config.ts`.
- To do: set `site.url` to the real domain before deploying (currently
  `http://localhost:4321/`).
- To do: write the first post in `src/content/posts/`. The About page
  (`src/content/pages/about.md`) is a short placeholder.
- Keep `LICENSE` and the README credits: the MIT license requires the original
  author's copyright notice.

## Checks

Run `npm run lint`, `npm run format:check`, `npm test`, and `npm run build`.
Astro warns that the posts collection is empty until a post exists.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
