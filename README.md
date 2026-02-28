# MILO

Web-based software starter for dog boarding facilities that also offer daycare, grooming, retail, and billing operations.

## Included in this starter

- Home page + login-capable frontend (`public/`)
- Authentication + role-based access
- Facility settings with kennel count, tax rates, and pricing
- Calendar availability + reservation quoting for day/night billing
- Customer + pet records
- Employee records
- Grooming appointment records
- Inventory item records
- Invoice and sales tax calculation endpoints
- Customer self-service portal (signup/login/pets/booking)

## Quick start

```bash
npm install
npm start
```

Default local URL: `http://localhost:3000`

Demo login:

- email: `admin@milo.local`
- password: `ChangeMe123!`

## API

See:

- `docs/api-overview.md`
- `docs/data-model.md`
- `docs/product-roadmap.md`

## Customer booking portal

- Public homepage: `https://milo-production-aac7.up.railway.app/`
- Hosted portal URL: `https://milo-production-aac7.up.railway.app/portal.html`
- Customers can create their own account, add pets, quote services, and submit reservations.
- Staff console: `https://milo-production-aac7.up.railway.app/app.html`

Embed this portal on your public website:

```html
<iframe
	src="https://milo-production-aac7.up.railway.app/portal.html"
	title="MILO Booking Portal"
	width="100%"
	height="900"
	style="border:0;max-width:1200px;"
	loading="lazy"
></iframe>
```

## Railway deploy flow

1. Push changes to `main` on GitHub.
2. Railway auto-deploys from that branch.
3. Ensure environment variables in Railway:
	- `JWT_SECRET` (required for production)
	- `TOKEN_TTL` (optional, default `12h`)

The app automatically binds to Railway `PORT`.
