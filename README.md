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

## Railway deploy flow

1. Push changes to `main` on GitHub.
2. Railway auto-deploys from that branch.
3. Ensure environment variables in Railway:
	- `JWT_SECRET` (required for production)
	- `TOKEN_TTL` (optional, default `12h`)

The app automatically binds to Railway `PORT`.
