# MILO

Starter repository for the MILO app with Git + GitHub + Railway deployment flow.

## 1) Create the first commit

```bash
git add .
git commit -m "chore: initialize project"
```

## 2) Connect this folder to GitHub

Create a new empty repo in GitHub named `MILO`, then run:

```bash
git remote add origin https://github.com/<your-username>/MILO.git
git push -u origin main
```

## 3) Connect GitHub to Railway (auto-deploy)

1. Open Railway dashboard.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select the `MILO` repository.
4. Choose the `main` branch.
5. In project settings, keep **Auto Deploy** enabled for `main`.

After this, every push to `main` from this workspace triggers a Railway deployment.

## 4) Daily workflow

```bash
git add .
git commit -m "feat: your change"
git push
```

Railway will deploy automatically after each push.
