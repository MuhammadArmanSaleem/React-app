# React + Node: separate frontend and backend

A minimal classroom example. One repository, two independent applications. Click a button in React to fetch a JSON message from Express. No database or extra features.

## Code structure

| File | Responsibility |
| --- | --- |
| `frontend/src/App.tsx` | React UI, loading/error state, and explicit `fetch` call |
| `frontend/src/main.tsx` | Mount React in the browser |
| `frontend/.env.example` | Backend URL used by the frontend |
| `backend/src/server.ts` | Express server, CORS, and `/api/message` route |
| `backend/.env.example` | Backend port and allowed frontend origin |
| Each folder's `package.json` | Its own dependencies and commands |
| Each folder's `tsconfig.json` | Its own TypeScript configuration |

The frontend does not import the backend code. It sends an HTTP request to the backend URL. Keeping both applications in one Git repository does not make them one running server.

## Requirements

Node.js 22.12+ (or Node.js 24) and npm. Use two terminal windows. Run each command from the indicated directory.

## 1. Start the backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

Backend environment:

```dotenv
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
```

Visit `http://localhost:4000/api/message` to see the JSON directly.

## 2. Start the frontend

In the second terminal, starting from the repository root:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev -- --port 5173 --strictPort
```

Frontend environment:

```dotenv
VITE_API_URL=http://localhost:4000
```

Open `http://localhost:5173` and click **Fetch backend message**. Both servers must be running. The fixed frontend port keeps its origin consistent with the backend CORS setting.

## Follow the request in class

1. Open `backend/src/server.ts`: Express defines `GET /api/message` and returns JSON.
2. Open `frontend/src/App.tsx`: React constructs the backend URL and calls `fetch`.
3. Open browser developer tools → Network, click the button, and inspect `/api/message`.
4. Notice the request goes to port 4000, while the page is served on port 5173.
5. Stop the backend and click again: React displays a request error.
6. Change `FRONTEND_ORIGIN` to `http://localhost:9999`, restart the backend, and click again: inspect the browser's CORS error. Restore the original value afterward.

## Production: deploy each folder separately

Use a static frontend host for `frontend/` and a Node server host for `backend/`. Both deployments can connect to this same repository, with different root directories. The domains below are placeholders, not live deployments.

| Setting | Frontend deployment | Backend deployment |
| --- | --- | --- |
| Root directory | `frontend` | `backend` |
| Install command | `npm install` | `npm install` |
| Build command | `npm run build` | `npm run build` |
| Output / start | Publish `dist/` as static files | `npm start` |
| Environment | `VITE_API_URL=https://api.example.com` | `FRONTEND_ORIGIN=https://class.example.com` |
| Port | Managed by static host | Use the host-provided `PORT`; otherwise set one |

Suggested order:

1. Deploy the backend with the intended frontend origin in `FRONTEND_ORIGIN`.
2. Check `https://api.example.com/api/message` returns JSON.
3. Set `VITE_API_URL` to the actual backend URL in the frontend host **before building**.
4. Build and deploy the frontend.
5. If the final frontend domain differs, update `FRONTEND_ORIGIN` and restart/redeploy the backend.
6. Open the deployed frontend and verify the request in the browser Network panel.

Use HTTPS for both domains. Do not use `localhost` in production: in a student's browser, it refers to that student's computer.

Vite embeds `VITE_API_URL` into the browser bundle at build time. Changing it requires rebuilding/redeploying the frontend. Restart Vite after changing local `.env` values. `VITE_*` values are public, so never put secrets there. Backend configuration is read when the server starts.

## Why CORS is configured

An origin consists of the scheme, hostname, and port. `http://localhost:5173` and `http://localhost:4000` are different origins. Browsers check the backend's CORS response headers before allowing frontend JavaScript to read a cross-origin response.

```ts
app.use(cors({ origin: frontendOrigin }));
```

This configures Express to send the allowed frontend origin in its response headers. Use the exact origin, without a URL path or trailing slash. This simple demo supports one frontend origin. Preview deployment domains need an intentional CORS configuration update if you want them to call the API.

CORS is not authentication and does not prevent tools such as curl from calling the API. Opening the backend URL directly also does not prove a React cross-origin request will work. Do not use `mode: "no-cors"` as a fix; its opaque response cannot be read by this app.

## Build locally

```bash
cd frontend
npm run build
cd ../backend
npm run build
npm start
```

The backend must have its environment configured. To inspect the built frontend, run `npm run preview -- --port 5173 --strictPort` from `frontend/` in another terminal. Vite preview is for local inspection; production hosts should serve the generated static files.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Missing API URL message | Copy frontend `.env.example` to `.env`, then restart Vite |
| Backend exits at startup | Set `FRONTEND_ORIGIN` in its environment |
| Failed to fetch | Backend running, URL correct, HTTPS consistent, browser console for CORS |
| CORS error | Exact frontend origin matches `FRONTEND_ORIGIN`; restart backend |
| HTTP 404 | API URL has no `/api/message` suffix; fetch adds that route |
| Old backend URL in production | Rebuild frontend after changing `VITE_API_URL` |

## Teaching context

This demonstrates one React architecture, not a React requirement. React handles the UI; Express supplies the server route here. Separate hosting is a choice, and a React frontend can also be served alongside a backend. Next.js provides frontend and server features in one framework, which can simplify this setup. This repo intentionally contains only the React + Express example.

References: [Vite environment variables](https://vite.dev/guide/env-and-mode) and [Express CORS middleware](https://expressjs.com/en/resources/middleware/cors/).
