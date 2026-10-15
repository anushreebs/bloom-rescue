# Complete updated Bloom Rescue project

This archive updates your uploaded earlier project. All original test paths are retained, and the latest component tests and three additional browser-test files are included. The backend files are byte-for-byte identical to your uploaded archive.

## What to copy into your existing Mac project

1. Unzip this archive and open its bloom-rescue folder.
2. Stop the frontend dev server with Control+C. Keep your backend running.
3. In /Users/anu/Documents/projects/bloom-rescue, rename your existing frontend folder to frontend-backup.
4. Copy the ENTIRE frontend folder from this extracted archive into /Users/anu/Documents/projects/bloom-rescue.
5. The resulting path must be /Users/anu/Documents/projects/bloom-rescue/frontend/package.json. Do not create frontend/frontend.
6. Run:

```bash
cd /Users/anu/Documents/projects/bloom-rescue/frontend
npm ci
npm run build
npm test
npm run dev
```

Open http://127.0.0.1:5173. You should see the Dark/Light button.

Keep your existing backend folder, .venv, database, .env and credentials. Do not replace them. Installed node_modules is deliberately excluded; npm ci recreates it for your Mac. No new API key is required for deterministic mode.

## Included frontend files

- src/: latest implementation, styles and App.test.tsx.
- e2e/: recovery.spec.ts, ui-redesign.spec.ts, v3-accessibility.spec.ts, v3-workflows.spec.ts.
- package.json and package-lock.json.
- Vite, TypeScript, ESLint, Vitest and Playwright configuration.
- scripts/ and README.md.

## Optional documentation update

The archive also includes updated docs/, design/ and artifacts/ folders. You may copy these separately if you want the latest reports and screenshots in your local project; they are not required to run the frontend.

## If the backend is stopped

Open a separate terminal:

```bash
cd /Users/anu/Documents/projects/bloom-rescue/backend
LLM_MODE=deterministic ../.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
```

For browser tests, stop your manually running frontend AND backend first, then from frontend run npx playwright install chromium and npm run e2e. The test runner starts its own local servers and isolated fictional database. npm test runs component tests without that server requirement.

The UI remains an independent fictional demonstration. Live model execution and actual employer integration are not established by this archive.
