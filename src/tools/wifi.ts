import { z } from 'zod';

export const wifiSchema = z.object({
  requestWifi: z.boolean().optional().nullable().default(true).describe('Set to true to get WiFi credentials'),
});

export async function getWifiPassword(params: z.infer<typeof wifiSchema>): Promise<any> {
  console.log('Providing WiFi credentials...');
  
  // Hard-coded WiFi credentials
  const wifiInfo = {
    networkName: 'SmartHotel_Guest',
    password: 'Welcome2025!Luxury',
    networkType: '5GHz & 2.4GHz available',
    notes: [
      'Connect to "SmartHotel_Guest" network',
      'Password is case-sensitive',
      'For premium high-speed WiFi, ask front desk about our VIP network',
      'If you experience any connectivity issues, please contact front desk at extension 0'
    ]
  };
  
  return wifiInfo;
}

