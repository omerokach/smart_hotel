// Type definitions for hotel services

export interface RoomServiceOrder {
  roomNumber: string;
  items: string[];
  specialInstructions?: string | null;
  estimatedTime: string;
}

export interface HousekeepingRequest {
  roomNumber: string;
  serviceType: 'full-clean' | 'quick-tidy' | 'turndown';
  preferredTime?: string;
  requestId: string;
}

export interface TowelRequest {
  roomNumber: string;
  quantity: number;
  towelType: 'bath' | 'hand' | 'pool' | 'all';
  requestId: string;
}

export interface SpaAppointment {
  roomNumber: string;
  treatment: string;
  preferredTime: string;
  duration: string;
  confirmationCode: string;
}

export interface EscalationRequest {
  roomNumber: string;
  requestType: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  ticketId: string;
  estimatedResponse: string;
  status: 'pending' | 'assigned' | 'resolved';
}

