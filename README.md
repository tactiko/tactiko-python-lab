# Tactiko Python Lab — Fast Trade Society

A mobile-friendly Spanish/English Python classroom: 12 beginner lessons, visual walkthroughs, a real browser Python editor, guided exercises, local progress, and an AI tutor interface.

## Publish the classroom

In this repository go to **Settings → Pages → Build and deployment → Deploy from a branch → main → / (root) → Save**.
GitHub will display the actual site URL after deployment. The expected URL is https://tactiko.github.io/tactiko-python-lab/ (not a deployment confirmation).

No npm install or build is needed for the classroom. Python downloads Pyodide from jsDelivr when Run is pressed; an internet connection is required. Examples run in a worker with a 60-second timeout. Walkthroughs explain the original example; they do not trace edits in the editor. Answer checks compare the exercise answer, not the submitted code. Progress stays in the current browser.

## Connect the AI tutor

GitHub Pages serves static files; it cannot run the AI backend. Deploy `server/` to a Node 22+ host, using `npm start` and setting the secret `OPENAI_API_KEY` in that host's secret settings. Do not commit, paste into frontend code, or send API keys in chat.

Set `ALLOWED_ORIGIN=https://tactiko.github.io` (or the exact origin of a custom domain). Set `OPENAI_MODEL` to a model your API project can use. Set a daily request limit with `MAX_DAILY_REQUESTS` (default 200). API usage is billed to the owner's OpenAI project.

After deployment, set `tutorEndpoint` in `config.js` to the real `https://YOUR-HOST/api/chat`. Users then share the same connection. The connection field in the site can override it in the current browser for setup/testing; it never accepts an API key.

The backend sends the question, lesson title, selected language, and up to six previous messages to OpenAI with `store:false`. It has no application database, and conversations remain in page memory. Hosting providers and OpenAI may have their own logging and retention policies. This is implementation documentation, not a published privacy policy.

## Operational limits

Limits are in-memory per server instance and reset on restart; the daily cap is a request cap, not a guaranteed dollar cap. The per-address limit uses the direct socket peer, so behind a proxy multiple users may share a bucket. CORS restricts browsers but is not authentication. For a larger public audience, add authenticated quotas and durable rate limits before increasing limits.

Lessons include synthetic security logs and hashing, not real-world scanning. The tutor is for Python learning and authorized lab practice.

## Local checks

`node --check app.js`
`node --check python-worker.js`
`node --check server/server.mjs`

To serve the classroom locally: `python -m http.server 8000` from the repository root. To run the tutor server, set the environment variables securely and run `node server/server.mjs`.

AI replies are not operational until a real backend and server-side key are configured. No fallback pretends to be AI.
