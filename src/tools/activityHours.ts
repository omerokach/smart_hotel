import { z } from 'zod';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load activity hours
let activityHoursData: any = null;
export function getActivityHours() {
  if (!activityHoursData) {
    const dataPath = join(__dirname, '../data/activity-hours.json');
    activityHoursData = JSON.parse(readFileSync(dataPath, 'utf-8'));
  }
  return activityHoursData;
}

export const activityHoursSchema = z.object({
  facilityName: z.string().describe('Name of the facility (e.g., "pool", "gym", "spa", "bar", "breakfast", "dinner", "front desk", "synagogue")'),
});

export async function getActivityHoursInfo(params: z.infer<typeof activityHoursSchema>): Promise<any> {
  console.log('🕐 Retrieving activity hours...', params);
  
  const data = getActivityHours();
  const facilityName = params.facilityName.toLowerCase();
  
  // Search for matching facility
  const facility = data.facilities.find((f: any) => 
    f.name.toLowerCase().includes(facilityName) || 
    facilityName.includes(f.name.toLowerCase())
  );
  
  if (facility) {
    return {
      facility: facility.name,
      hours: facility.hours,
      notes: facility.notes,
    };
  }
  
  // Return all facilities if no match found
  return {
    message: 'Facility not found. Here are all available facilities:',
    facilities: data.facilities,
  };
}

