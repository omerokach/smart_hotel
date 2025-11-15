// Type definitions for hotel services

export interface RoomServiceOrder {
  items: string[];
  specialInstructions?: string | null;
  estimatedTime: string;
}

export interface HousekeepingRequest {
  serviceType: 'full-clean' | 'quick-tidy' | 'turndown';
  preferredTime?: string;
  requestId: string;
}

export interface SpaAppointment {
  treatment: string;
  preferredTime: string;
  duration: string;
  confirmationCode: string;
}

export interface EscalationRequest {
  requestType: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  ticketId: string;
  estimatedResponse: string;
  status: 'pending' | 'assigned' | 'resolved';
}

export interface TaxiOrder {
  destination: string;
  numberOfPassengers: number;
  pickupDay: string;
  pickupTime: string;
  orderId: string;
}

export interface ExtraEquipmentRequest {
  equipmentType: string;
  quantity: number;
  specificItem?: string;
  requestId: string;
}

