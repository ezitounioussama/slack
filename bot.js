import 'dotenv/config';
import bolt from '@slack/bolt';
const { App, LogLevel } = bolt;

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
  appToken: process.env.SLACK_APP_TOKEN,
  port: Number(process.env.PORT) || 3000,
  logLevel: LogLevel.INFO
});

// Handle /hello slash command
app.command('/hello', async ({ command, ack, respond }) => {
  await ack();
  await respond({
    text: `Hello, <@${command.user_id}>! How can I help you today?`,
  });
});

// Log all public channel messages
app.event('message', async ({ event }) => {
  if ('subtype' in event && event.subtype !== undefined) return;

  console.log(`Message from ${event.user}: ${event.text}`);
});

// Start app
(async () => {
  await app.start();
  console.log(`⚡️ Slack bot is running on port ${process.env.PORT || 3000}`);
})();