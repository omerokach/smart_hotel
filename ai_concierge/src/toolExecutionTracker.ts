// Global tracker for service tool executions
let lastServiceToolExecution: {
  toolName: string;
  args: any;
  timestamp: number;
} | null = null;

export function trackServiceToolExecution(toolName: string, args: any) {
  lastServiceToolExecution = {
    toolName,
    args,
    timestamp: Date.now(),
  };
  console.log('🔔 Service tool executed:', toolName);
}

export function getAndClearLastServiceToolExecution() {
  const execution = lastServiceToolExecution;
  lastServiceToolExecution = null;
  return execution;
}

