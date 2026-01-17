import { google } from 'googleapis';
import * as chrono from 'chrono-node';
import { DateTime } from 'luxon';

type InviteResult = {
  success: boolean;
  message?: string;
  eventId?: string;
};

interface SpaInviteDetails {
  guestEmail: string;
  guestName?: string | null;
  treatment: string;
  preferredTime: string;
  durationMinutes?: number | null;
  confirmationCode?: string;
  roomNumber?: string;
}

const CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar'];
const DEFAULT_REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:3000/oauth2callback';

function normalizePrivateKey(key: string) {
  return key.replace(/\\n/g, '\n');
}

async function getCalendarAuth() {
  const keyFile =
    process.env.GOOGLE_SERVICE_ACCOUNT_KEYFILE || process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (keyFile) {
    const auth = new google.auth.GoogleAuth({ keyFile, scopes: CALENDAR_SCOPES });
    const client = await auth.getClient();
    return { authClient: client, type: 'service_account' as const };
  }

  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (serviceAccountEmail && serviceAccountKey) {
    const jwtClient = new google.auth.JWT({
      email: serviceAccountEmail,
      key: normalizePrivateKey(serviceAccountKey),
      scopes: CALENDAR_SCOPES,
    });
    return { authClient: jwtClient, type: 'service_account' as const };
  }

  const oauthClientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const oauthClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const oauthRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (oauthClientId && oauthClientSecret && oauthRefreshToken) {
    const oauth2Client = new google.auth.OAuth2(oauthClientId, oauthClientSecret, DEFAULT_REDIRECT_URI);
    oauth2Client.setCredentials({ refresh_token: oauthRefreshToken });
    return { authClient: oauth2Client, type: 'oauth' as const };
  }

  return null;
}

function parsePreferredTime(preferredTime: string, timeZone: string): Date | null {
  if (!preferredTime) {
    return null;
  }

  const reference = { instant: new Date(), timezone: timeZone };
  const [result] = chrono.parse(preferredTime, reference, { forwardDate: true });

  if (result?.start) {
    const getComponent = (component: chrono.Component, fallback: number) =>
      result.start.get(component) ?? fallback;

    const year = result.start.get('year');
    const month = result.start.get('month');
    const day = result.start.get('day');

    if (year && month && day) {
      const zoned = DateTime.fromObject(
        {
          year,
          month,
          day,
          hour: getComponent('hour', 12),
          minute: getComponent('minute', 0),
          second: getComponent('second', 0),
          millisecond: getComponent('millisecond', 0),
        },
        { zone: timeZone },
      );
      if (zoned.isValid) {
        return zoned.toJSDate();
      }
    }
  }

  const isoFallback = DateTime.fromISO(preferredTime, { zone: timeZone, setZone: true });
  if (isoFallback.isValid) {
    return isoFallback.toJSDate();
  }

  const direct = new Date(preferredTime);
  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }
  return null;
}

function buildDescription(details: SpaInviteDetails) {
  const lines = [
    `Thank you for booking a ${details.treatment} with our spa.`,
    `Preferred Time: ${details.preferredTime}`,
  ];
  if (details.guestName || details.guestEmail) {
    const guestParts = [details.guestName, details.guestEmail].filter(Boolean).join(' • ');
    lines.push(`Guest: ${guestParts}`);
  }
  if (details.roomNumber) {
    lines.push(`Room Number: ${details.roomNumber}`);
  }
  if (details.confirmationCode) {
    lines.push(`Confirmation Code: ${details.confirmationCode}`);
  }
  lines.push('We look forward to welcoming you!');
  return lines.join('\n');
}

export async function sendSpaCalendarInvite(details: SpaInviteDetails): Promise<InviteResult> {
  if (!details.guestEmail) {
    return { success: false, message: 'Missing guest email' };
  }

  const authConfig = await getCalendarAuth();
  if (!authConfig) {
    console.warn('⚠️ Google Calendar auth not configured. Skipping invite creation.');
    return { success: false, message: 'Calendar auth missing' };
  }

  const calendarId = process.env.SPA_CALENDAR_ID || process.env.GOOGLE_CALENDAR_ID;
  const timeZone = 'Asia/Jerusalem';

  if (!calendarId) {
    console.warn('⚠️ Google Calendar ID missing. Set SPA_CALENDAR_ID or GOOGLE_CALENDAR_ID.');
    return { success: false, message: 'Calendar configuration missing' };
  }

  const startDate = parsePreferredTime(details.preferredTime, timeZone);
  if (!startDate) {
    console.warn('⚠️ Unable to parse preferred spa time. Skipping calendar invite.');
    return { success: false, message: 'Unable to parse preferred time' };
  }

  const durationMinutes = Number(details.durationMinutes) || 60;
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  try {
    if (authConfig.type === 'service_account' && 'authorize' in authConfig.authClient) {
      await authConfig.authClient.authorize();
    }
    const calendar = google.calendar({ version: 'v3', auth: authConfig.authClient });
    
    const isServiceAccount = authConfig.type === 'service_account';
    const attendeeList = isServiceAccount
      ? undefined
      : [
          {
            email: details.guestEmail,
            displayName: details.guestName || undefined,
          },
        ];

    const eventResponse = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `${details.treatment} - Spa Appointment`,
        description: buildDescription(details),
        start: {
          dateTime: startDate.toISOString(),
          timeZone,
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone,
        },
        attendees: attendeeList,
        reminders: {
          useDefault: true,
        },
      },
      sendUpdates: isServiceAccount ? 'none' : 'all',
    });

    console.log('📅 Google Calendar invite created:', eventResponse.data.id);
    return { success: true, eventId: eventResponse.data.id || undefined };
  } catch (error) {
    console.error('❌ Failed to create Google Calendar invite:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}
