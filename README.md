# SwiftGo Restaurant Panel

Order & menu management panel for SwiftGo restaurant owners, live at
**https://ousamaaboukhalil.github.io/rest_panel/**.

> The custom domain `restaurants.swiftgo.online` is offline — `swiftgo.online`
> expired 2026-06-11 (status `pendingDelete`). Once the domain is redeemed,
> re-add the custom domain in Pages settings and restore the `CNAME` file
> (content: `restaurants.swiftgo.online`). The build uses relative paths and a
> hash router, so the same build works at both URLs.

Complete rebuild of the original Flutter-web panel
([Rest_panel_BaseCode](https://github.com/OusamaAbouKhalil/Rest_panel_BaseCode))
as a React + Vite + Tailwind app on the Firebase JS SDK.

## Repo layout

- `app/` — the source (Vite + React 18 + Tailwind v4)
- repo root — the **built** site, served by GitHub Pages (main branch, `/` root, `CNAME`)

## Features

- **Live orders board** — realtime lanes (needs attention / scheduled / in kitchen / out for delivery), one-click Accept / Reject / Start Preparing, sound + browser notifications for genuinely new orders only
- **Order details** — items with sizes, addons, combos, special instructions; delivery info; totals
- **History** — search, status + date-range filters, pagination
- **Menu manager** — add/edit/delete items, inline availability toggle, per-item and bulk discounts, sizes/combos editors, addons subcollection editor, image upload to Storage
- **Settings** — restaurant name, logo & cover upload, temporarily-closed toggle (also in the header)
- **Analytics** — daily revenue chart, orders by status, top sellers
- Dark/light theme, fully responsive (bottom nav on mobile)

## Develop

```bash
cd app
npm install
npm run dev
```

## Deploy

```bash
cd app
npm run deploy   # builds and copies dist/ into the repo root
git add -A && git commit -m "deploy" && git push
```

GitHub Pages serves the main branch root — no further steps.

## Data contracts (Firestore)

- Auth: `restOwners/{uid}.rest_id` → restaurant
- `restaurants/{rest_id}`: `rest_name`, `main_image`, `bg_image`, `isClosed`
- `restaurants/{rest_id}/menu_items/{id}`: `item_id` (= doc id), `item_name`, `item_price`,
  `item_category`, `item_description`, `item_discount` (%), `available`, `item_image`,
  `sizes` (map name→extra $), `combo` (map name→$), subcollection `addons` (`addon_name`, `addon_price`)
- `orders` where `restaurant_id == rest_id`; statuses: `scheduled | pending | accepted |
  preparing | on the way | completed | cancelled | rejected`; items in `orders/{id}/items`
- Customer FCM token: RTDB `users/{uid}/firebaseMessagingToken`; push via callable `sendNotification`
