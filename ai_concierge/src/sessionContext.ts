// Shared session context for tools to access current session data
// This is a simple solution to pass room number to tools during agent execution

let currentRoomNumber: string = '103';

export function setCurrentRoomNumber(roomNumber: string): void {
  currentRoomNumber = roomNumber;
}

export function getCurrentRoomNumber(): string {
  return currentRoomNumber;
}

