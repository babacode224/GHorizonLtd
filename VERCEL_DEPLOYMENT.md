# Deploying GHorizon Ltd on Vercel

The project now includes a Vercel serverless API entrypoint at `api/[...path].ts` and SPA routing for public/client-side routes. The deployment must use the repository root as its project directory, `pnpm install --frozen-lockfile` as the install command, `pnpm build` as the build command, and `dist/public` as the output directory. These values are already configured in `vercel.json`.

## Required Vercel environment variables

The public pages can render without a database, but property management, public catalogue data, enquiries, maps, uploads, and OAuth-dependent functionality require environment configuration in **Vercel Project Settings → Environment Variables**.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | External MySQL/TiDB-compatible production database connection string. |
| `JWT_SECRET` | Secure session-signing secret. |
| `OAUTH_SERVER_URL`, `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL` | Required only if Manus OAuth is re-enabled for a route. |
| `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`, `VITE_FRONTEND_FORGE_API_URL`, `VITE_FRONTEND_FORGE_API_KEY` | Required by Manus-managed storage and map integrations. These are not automatically available on Vercel. |

> The current `/admin` workspace does not require sign-in, but it does require `DATABASE_URL` to save listings. Image uploads on Vercel require replacing the Manus storage proxy with an external S3-compatible storage provider and supplying that provider’s credentials.

After adding all required variables, redeploy from Vercel. Use the Vercel deployment log to check the `api/[...path].ts` function if an `/api/trpc` request fails.
