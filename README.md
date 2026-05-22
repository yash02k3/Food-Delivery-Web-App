# AgriLink

Premium construction material delivery platform — cement, steel, bricks, tiles & more delivered to your site.

## Stack

- **Frontend:** React, Vite, Redux Toolkit, Redux Persist, MUI, Framer Motion, Axios
- **Backend:** Node.js, Express, MongoDB, JWT, Razorpay (test mode)
- **Deploy:** Vercel (client) + Render (server)

## Quick Start

```bash
# 1. Install all dependencies
npm install
cd client && npm install
cd ../server && npm install

# 2. Configure server/.env
PORT=5002
MONGODB_URI=mongodb://127.0.0.1:27017/agrilink
JWT_SECRET=agrilinksecret
CLIENT_URL=http://localhost:5173

# 3. Seed database (131 products)
cd server && npm run seed

# 4. Run both (from project root)
cd .. && npm run dev
```

- Frontend: http://localhost:5173 (proxies `/api` → backend)
- API: http://localhost:5002/api/health (auto-fallback if port busy)

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| User | user@agrilink.in | password123 |
| Admin | admin@agrilink.in | password123 |
| Supplier | supplier@agrilink.in | password123 |

## Coupons

- `BUILD10` — 10% off above ₹1000
- `FLAT200` — ₹200 off above ₹1500
- `AGRI50` — ₹50 off above ₹500

## Payment Options

1. **Cash on Delivery** — pay on delivery
2. **50% Advance** — half now, half on delivery (bulk orders)
3. **Full Online** — Razorpay TEST mode (auto-simulated)

## Features

- JWT auth (login, signup, forgot password)
- Dynamic addresses (geolocation + save Home/Work/Site)
- 100+ products with brand variants
- Cart, wishlist, coupons, GST invoice
- Live order tracking
- Supplier & Admin dashboards

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Products not loading | Ensure `npm run dev` shows API on port 5000. Check `/api/health` |
| Port in use | Set `PORT=5002` in server/.env and matching `VITE_PROXY_TARGET` in client |
| Login fails | Run `npm run seed` in server folder |
| CORS errors | `CLIENT_URL` in server/.env must match Vite URL |

## Footer

Developed by Tarun, Gagan, Akshay · 999999999 · India · global@gmail.com
