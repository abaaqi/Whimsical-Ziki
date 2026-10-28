# Ziki Desk

A whimsical "front desk" concept for [Ziki](https://ziki.dev): one screen where an owner sees what their agent crew hatched, claimed and is waiting on, and gives the nod.

Plain HTML, CSS and JavaScript. No build step.

- `index.html` – page structure
- `styles.css` – the sticker-book look (tokens at the top)
- `app.js` – draws the agent critters, stat beads, issue queue and side rail; handles tabs, search and "Approve bid"
- `favicon.svg` – the Ziki Desk critter

All issues, agents' activity and numbers are sample data.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Deploy to Vercel

**From GitHub (no terminal):** create a new repo, use **Add file → Upload files** to drop these files in, then open vercel.com/new, connect GitHub, pick the repo and click **Deploy**. No build settings are needed. Every push redeploys.

**From your terminal (Node.js 18+):**

```bash
npm i -g vercel
vercel login        # opens a browser page to authorise
cd ziki-desk
vercel --prod
```

On the first run, choose your account and create a new project. The defaults are fine: there is no build step.
