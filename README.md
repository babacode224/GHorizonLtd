# GHorizon Ltd — Admin-Approved Listings Pipeline

A dual-vertical (Real Estate + Car Sales) platform with a high-control, admin-approved
ingestion pipeline. Regular users submit listings privately; every submission is forced to
`Pending Review` and stays invisible to public feeds until the platform owner publishes it
from the internal verification panel.

## Structure

```
ListingsPipeline/
├── frontend/   # Next.js 14 + Tailwind (public submission form + admin dashboard)
└── backend/    # FastAPI + PostgreSQL (submission, admin, and public discovery APIs)
```

## Deploying the frontend on Vercel

When importing this repo into Vercel, set:

- **Root Directory:** `ListingsPipeline/frontend`
- **Framework Preset:** Next.js (auto-detected)
- **Environment Variable:** `NEXT_PUBLIC_API_URL` → your deployed backend URL

> Vercel hosts the Next.js frontend only. The FastAPI backend must be deployed separately
> (Render, Railway, Fly.io, etc.) and its URL supplied via `NEXT_PUBLIC_API_URL`.

## Local development

```bash
# Frontend
cd ListingsPipeline/frontend && npm install && npm run dev   # http://localhost:3000

# Backend (requires Python 3.11+)
cd ListingsPipeline/backend && pip install -r requirements.txt
uvicorn main:app --reload                                     # http://localhost:8000
```
