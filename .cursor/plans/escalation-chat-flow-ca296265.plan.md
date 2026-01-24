<!-- ca296265-f7bd-4c16-aa73-44f83979619f eb354766-7f50-4875-b137-0bc6f2b6bfe2 -->
# Google Calendar Integration for Spa Bookings

## Prerequisites (Manual Setup Required)

1. **Google Cloud Console Setup**:

                                                                                                - Create a project at console.cloud.google.com
                                                                                                - Enable "Google Calendar API"
                                                                                                - Create a **Service Account** (for server-to-server auth)
                                                                                                - Download the JSON credentials file
                                                                                                - Add credentials to environment variables

2. **Environment Variables** (add to `.env`):
   ```
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   GOOGLE_CALENDAR_ID=primary (or a specific calendar ID)
   ```


## Files to Modify/Create

### 1. New File: `ai_concierge/src/services/googleCalendar.ts`

Create a service module to handle Google Calendar API calls:

- `sendCalendarInvite(guestEmail, treatment, dateTime, duration)` function
- Uses `googleapis` npm package
- Authenticates via service account credentials

### 2. Modify: `ai_concierge/src/tools/spa.ts`

Update `bookSpaAppointment()` to:

- Import `getCurrentRoomNumber` from sessionContext
- Fetch guest email from Reservations API using room number
- Call `sendCalendarInvite()` after successful booking

### 3. Modify: `ai_concierge/src/sessionContext.ts`

Already has room number - may need to also store guest email for efficiency.

### 4. Install dependency

```bash
npm install googleapis
```

## Flow

```
Guest books spa → spa.ts executes → 
 1. Get room number from session context
 2. Fetch guest email from Reservations API (GET /api/reservations?room=X)
 3. Create calendar event via Google Calendar API
 4. Send invite to guest email
 5. Return booking confirmation
```

## API Endpoint Needed

Check if this endpoint exists, or ask your friend to add it:

- `GET /api/reservations/by-room/:room_number` - returns guest details including email

### To-dos

- [ ] Set up Google Cloud project, enable Calendar API, create service account
- [ ] Create googleCalendar.ts service module with sendCalendarInvite function
- [ ] Update spa.ts to fetch guest email and send calendar invite after booking
- [ ] Install googleapis npm package