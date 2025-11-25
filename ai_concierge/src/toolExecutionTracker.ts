// Global tracker for service tool executions
let lastServiceToolExecution: {
  toolName: string;
  args: any;
  timestamp: number;
  result?: any;
} | null = null;

let lastEscalationExecution: {
  toolName: string;
  args: any;
  result: any;
  timestamp: number;
} | null = null;

export function trackServiceToolExecution(toolName: string, args: any, result?: any) {
  lastServiceToolExecution = {
    toolName,
    args,
    timestamp: Date.now(),
    result,
  };
  console.log('🔔 Service tool executed:', toolName);
}

export function trackEscalationExecution(toolName: string, args: any, result: any) {
  lastEscalationExecution = {
    toolName,
    args,
    result,
    timestamp: Date.now(),
  };
  console.log('🚨 Escalation tool executed:', toolName);
}

export function getAndClearLastServiceToolExecution() {
  const execution = lastServiceToolExecution;
  lastServiceToolExecution = null;
  return execution;
}

export function getAndClearLastEscalationExecution() {
  const execution = lastEscalationExecution;
  lastEscalationExecution = null;
  return execution;
}

