import { z } from 'zod';
import type { TowelRequest } from '../types.js';

export const towelRequestSchema = z.object({
  roomNumber: z.string().describe('The guest room number'),
  quantity: z.number().min(1).max(20).describe('Number of towels needed (1-20)'),
  towelType: z.enum(['bath', 'hand', 'pool', 'all']).describe(
    'Type of towels: bath (large bath towels), hand (small hand towels), pool (pool towels), or all (assortment)'
  ),
});

export async function requestTowels(params: z.infer<typeof towelRequestSchema>): Promise<TowelRequest> {
  // Simulate API call to housekeeping/linen management
  console.log('🛁 Processing towel request...', params);
  
  // In a real application, this would:
  // 1. Validate room number
  // 2. Check linen inventory
  // 3. Create delivery task for housekeeping
  // 4. Update inventory system
  // 5. Track delivery status
  
  const requestId = generateTowelRequestId();
  
  const request: TowelRequest = {
    roomNumber: params.roomNumber,
    quantity: params.quantity,
    towelType: params.towelType,
    requestId,
  };
  
  return request;
}

function generateTowelRequestId(): string {
  return `TWL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

