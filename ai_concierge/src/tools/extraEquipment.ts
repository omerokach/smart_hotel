import { z } from 'zod';
import type { ExtraEquipmentRequest } from '../types.js';

export const extraEquipmentSchema = z.object({
  equipmentType: z.enum([
    'blanket',
    'toilet-paper',
    'robe',
    'gloves',
    'towels',
    'shampoo',
    'conditioner',
    'bath-soap',
    'hand-soap',
    'body-lotion',
    'dental-kit',
    'shaving-kit',
    'slippers',
    'hangers',
    'pillow',
    'hair-dryer',
    'iron',
    'other'
  ]).describe('Type of equipment needed'),
  quantity: z.number().min(1).max(4).describe('Number of items needed (1-4)'),
  specificItem: z.string().optional().nullable().describe('Specify if "other" is selected'),
});

export async function requestExtraEquipment(params: z.infer<typeof extraEquipmentSchema>): Promise<ExtraEquipmentRequest> {
  // Simulate API call to housekeeping/supplies management
  console.log('📦 Processing extra equipment request...', params);
  
  // In a real application, this would:
  // 1. Validate equipment availability
  // 2. Check inventory
  // 3. Create delivery task for housekeeping
  // 4. Update inventory system
  // 5. Track delivery status
  
  const requestId = generateEquipmentRequestId();
  
  const request: ExtraEquipmentRequest = {
    equipmentType: params.equipmentType,
    quantity: params.quantity,
    specificItem: params.specificItem,
    requestId,
  };
  
  return request;
}

function generateEquipmentRequestId(): string {
  return `EQP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

