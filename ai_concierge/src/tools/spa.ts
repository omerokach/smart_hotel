import { z } from 'zod';
import type { SpaAppointment } from '../types.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { trackServiceToolExecution } from '../toolExecutionTracker.js';

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
SPA TOOL - EXACT CONVERSATION FLOW:

STEP 1: INITIAL REQUEST (User clicks button or says "Book Spa")
→ Response: "Hello! Welcome to our Spa. I would be happy to help you select and schedule a treatment. Which treatment would you like to book?"
   (Proactively show the spa menu with treatments, prices, and durations)

STEP 2: GUEST SELECTS TREATMENT (User says "Deep Tissue Massage")
→ CRITICAL: Do NOT show the menu again.
→ Response: "Great choice! When would you like to schedule your [treatment name]?"

STEP 3: GUEST PROVIDES TIME (User says "tomorrow at 6:30 PM")
→ Confirm naturally: "[Treatment name], [day/time]. Should I book it for you?"
→ Examples:
   • "Deep Tissue Massage, tomorrow at 6:30 PM. Should I book it for you?"
   • "Swedish Massage, today at 3:00 PM. Should I book it for you?"
   • "Signature Facial, Friday at 11:00 AM. Should I book it for you?"
→ Keep it SHORT and conversational.

STEP 4: CONFIRMATION (User says "Yes/Confirm")
→ Execute spaTool
→ Response: "You're all set! Your [treatment name] is booked for [time]. We look forward to seeing you at the spa!"

CRITICAL RULES:
- If user ALREADY selected treatment (e.g., "I want a massage"), SKIP Step 1 and go STRAIGHT to Step 2.
- NEVER show the menu if the guest has already named their treatment.
- Execute tool ONLY after Step 4 (Guest confirms).
- Keep confirmations SHORT and NATURAL - avoid "Let me confirm your request:" or robotic phrasing.
`;

export const spaBookingSchema = z.object({
  treatment: z.string().describe('Type of spa treatment (e.g., massage, facial, manicure, body wrap)'),
  preferredTime: z.string().describe('Preferred appointment time (e.g., "3:00 PM tomorrow", "this afternoon")'),
  duration: z.enum(['30', '60', '90', '120']).optional().nullable().describe('Treatment duration in minutes (30, 60, 90, or 120)'),
});

export async function bookSpaAppointment(params: z.infer<typeof spaBookingSchema>): Promise<SpaAppointment> {
  // Track this service tool execution
  trackServiceToolExecution('book_spa_appointment', params);
  
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

