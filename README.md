# Slack Bolt App (/hello)

A minimal Slack app using Slack Bolt for Node.js that implements a `/hello` slash command and logs channel messages.

## Features

- Slash command `/hello`
- HTTP receiver on `/slack/events`
- Message event logging with human‑readable timestamp

Files
- `bot.js` – App initialization and handlers
- `package.json` – Dependencies and ESM module config
- `.env` – Local environment variables (ignored by Git)
- `.gitignore` – Ensures secrets and local artifacts aren’t committed

## Prerequisites

- Node.js 18+ (Node 22 supported)
- A Slack workspace where you can install a custom app
- An app created at https://api.slack.com/apps

## 1) Configure your Slack App

1. Basic setup
   - Go to your app: https://api.slack.com/apps
   - Select your app → Basic Information → note the Signing Secret

2. Add bot user and scopes
   - Features → OAuth & Permissions → Scopes (Bot Token Scopes)
   - Add at least:
     - `commands`
     - `chat:write`
   - Click “Install to Workspace” (or “Reinstall to Workspace”) and copy the Bot User OAuth Token (starts with `xoxb-`).

3. Slash command
   - Features → Slash Commands → Create New Command
   - Command: `/hello`
   - Request URL: `https://<your-public-domain>/slack/events`
   - Short description: Hello test
   - Save

4. (Optional) Event subscriptions for message logs
   - Features → Event Subscriptions → Enable
   - Request URL: `https://<your-public-domain>/slack/events`
   - After it verifies, Subscribe to bot events: `message.channels` (and others as needed)
   - Save and reinstall if prompted

## 2) Local environment

Create `.env` in the project root with:

```
SLACK_BOT_TOKEN="xoxb-your-bot-token"
SLACK_SIGNING_SECRET="your-signing-secret"
PORT=3000
```

Security: never commit `.env`. It’s already in `.gitignore`.

## 3) Run the app (HTTP mode)

1. Install dependencies

```
npm install
```

2. Start your app

```
node bot.js
# or with auto-restart
npx nodemon bot.js
```

You should see:

```
⚡️ Slack bot is running on port 3000
```

3. Expose your app publicly (for Slack to reach it)

- Using ngrok:

```
ngrok http 3000
```

Copy the HTTPS URL, e.g. `https://abcd-1234.ngrok-free.app`

4. Set Slack Request URLs to your tunnel

- Slash Commands → `/hello` → Request URL:
  - `https://abcd-1234.ngrok-free.app/slack/events`
- Event Subscriptions (if enabled) → Request URL:
  - `https://abcd-1234.ngrok-free.app/slack/events`

## 4) Try it

- In Slack, in a channel where the bot is present (or a DM with the bot):
  - Type `/hello`
- You should receive a message back.

## How it works (code overview)

- `new App({ token, signingSecret, port })` creates the Bolt app using the HTTP receiver with the default path `/slack/events`.
- `app.command('/hello', ...)` handles the slash command. It acknowledges the command within 3 seconds and responds in the same context.
- `app.event('message', ...)` logs incoming messages and formats the Slack `event_ts` into local time.

## Troubleshooting

- dispatch_failed
  - Cause: Slack can’t reach your app or did not get a 200 response within 3 seconds.
  - Fix:
    - Ensure your app is running and your tunnel URL is active.
    - Make sure Request URLs end with `/slack/events` (not `/hello`).
    - Check Signing Secret matches and the URL is HTTPS.

- URL verification failed (challenge not echoed)
  - Ensure the app is running when you paste the URL.
  - Use the exact path `/slack/events`.
  - Correct Signing Secret in `.env`.

- invalid_auth
  - Your token is invalid/revoked or from the wrong app/workspace.
  - Recopy the Bot User OAuth Token from OAuth & Permissions.
  - Reinstall the app after changing scopes.
  - Quick test:

```
curl -s -H "Authorization: Bearer $SLACK_BOT_TOKEN" https://slack.com/api/auth.test
```

- Port already in use (EADDRINUSE)
  - Stop other processes using port 3000, or run with a different port:

```
PORT=3001 node bot.js
```

- See verbose logs

```
DEBUG=bolt:* node bot.js
```

## Optional: Socket Mode (no public URL required)

If you don’t want to use ngrok/tunnels:

1. Create an App-Level Token (xapp-)
   - Basic Information → App-Level Tokens → Generate Token
   - Add scope: `connections:write`

2. Add to `.env`:

```
SLACK_APP_TOKEN="xapp-your-app-level-token"
```

3. Update `bot.js` (example change):

```js
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: Number(process.env.PORT) || 3000,
});
```

4. Restart the app. Slash commands and events will work without public URLs.

## Extending the app

- Show user names instead of IDs for replies
  - Add scope `users:read` and use `client.users.info({ user: command.user_id })` to resolve `display_name`.
- DM the user on `/hello`
  - Add scope `im:write`, call `client.conversations.open({ users: command.user_id })`, then `client.chat.postMessage({ channel: dmId, ... })`.

## License

GOTODEV © 2025
