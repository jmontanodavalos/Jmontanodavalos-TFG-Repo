export interface Toast {
  message: string;
  duration?: number; // opcional, por defecto 10s
  startTime?: number;
  remainingTime?: number;
  timeoutId?: any;
  paused?: boolean;
  type: 'success' | 'error' | 'info';
}
