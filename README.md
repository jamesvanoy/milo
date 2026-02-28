# MILO

Starter repository for the MILO app with a deployable Node service and GitHub + Railway flow.

## Runtime

- Node.js 18+
- Start command: `npm start`

The app listens on `PORT` and responds with JSON.

## Connect GitHub to Railway (auto-deploy)

1. Open Railway dashboard.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select the `MILO` repository.
4. Choose the `main` branch.
5. In project settings, keep **Auto Deploy** enabled for `main`.

After this, every push to `main` from this workspace triggers a Railway deployment.

## Daily workflow

```bash
git add .
git commit -m "feat: your change"
git push
```

Railway will deploy automatically after each push.
