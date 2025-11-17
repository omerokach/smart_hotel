import { z } from 'zod';
import type { SpaAppointment } from '../types.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the spa menu
let spaMenu: any = null;
export function getSpaMenu() {
  if (!spaMenu) {
    const menuPath = join(__dirname, '../data/spa-menu.json');
    spaMenu = JSON.parse(readFileSync(menuPath, 'utf-8'));
  }
  return spaMenu;
}

// Tool-specific behavioral instructions
export const spaInstructions = `
SPA SERVICE BEHAVIOR:
- When guests inquire about spa services, wellness treatments, or relaxation options, reference the spa menu data
- Present relevant options with prices, durations, and descriptions
- Only accept bookings for treatments that are on the spa menu
- If a guest requests something not on the menu, politely inform them and suggest similar alternatives
- For unavailable treatments, offer to escalate for special requests

RESPONSE FORMAT:
- After confirmation, respond: "All set! Your spa appointment is confirmed for [time]. Enjoy!"
- Do NOT ask follow-up questions after confirming the appointment
- Keep the final response brief and close the conversation
`;

export const spaBookingSchema = z.object({
  treatment: z.string().describe('Type of spa treatment (e.g., massage, facial, manicure, body wrap)'),
  preferredTime: z.string().describe('Preferred appointment time (e.g., "3:00 PM tomorrow", "this afternoon")'),
  duration: z.enum(['30', '60', '90', '120']).optional().nullable().describe('Treatment duration in minutes (30, 60, 90, or 120)'),
});

export async function bookSpaAppointment(params: z.infer<typeof spaBookingSchema>): Promise<SpaAppointment> {
  // Simulate API call to spa booking system
  console.log('💆 Processing spa booking...', params);
  
  // In a real application, this would:
  // 1. Validate room number and guest details
  // 2. Check spa availability and therapist schedules
  // 3. Verify treatment type and duration
  // 4. Create appointment in spa management system
  // 5. Send confirmation to guest
  // 6. Block calendar slot
  
  const confirmationCode = generateConfirmationCode();
  const defaultDuration = params.duration || inferDuration(params.treatment);
  
  const appointment: SpaAppointment = {
    treatment: params.treatment,
    preferredTime: params.preferredTime,
    duration: `${defaultDuration} minutes`,
    confirmationCode,
  };
  
  return appointment;
}

function generateConfirmationCode(): string {
  return `SPA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

function inferDuration(treatment: string): string {
  const lowerTreatment = treatment.toLowerCase();
  if (lowerTreatment.includes('massage')) return '60';
  if (lowerTreatment.includes('facial')) return '60';
  if (lowerTreatment.includes('manicure') || lowerTreatment.includes('pedicure')) return '45';
  if (lowerTreatment.includes('body wrap')) return '90';
  return '60'; // default
}

