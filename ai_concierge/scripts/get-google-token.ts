import readline from 'readline';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

async function main() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET environment variables.');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  console.log('');
  console.log('1) Visit this URL and complete the Google consent flow:');
  console.log(authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('\n2) Paste the authorization code here: ', async (code) => {
    rl.close();
    try {
      const { tokens } = await oauth2Client.getToken(code.trim());
      if (!tokens.refresh_token) {
        console.error('No refresh token returned. Ensure you used `prompt=consent` and haven’t exceeded the token limit.');
        process.exit(1);
      }
      console.log('\n✅ Google OAuth Refresh Token:');
      console.log(tokens.refresh_token);
      console.log('\nAdd this to your .env file as GOOGLE_REFRESH_TOKEN.');
    } catch (error) {
      console.error('Failed to exchange code for tokens:', error);
      process.exit(1);
    }
  });
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
