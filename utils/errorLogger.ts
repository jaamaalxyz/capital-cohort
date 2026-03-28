import { AppError } from '../types';

export function createAppError(
  error: Error,
  componentStack?: string,
  context?: string
): AppError {
  const message = error instanceof Error ? error.message : String(error);
  return {
    message,
    componentStack,
    timestamp: new Date().toISOString(),
    context,
  };
}

export function formatError(appError: AppError): string {
  const contextPart = appError.context ? ` [${appError.context}]` : '';
  const date = new Date(appError.timestamp).toLocaleString();
  return `[${date}]${contextPart} ${appError.message}`;
}

export function logError(
  error: Error,
  componentStack?: string,
  context?: string
): void {
  try {
    const appError = createAppError(error, componentStack, context);
    console.error('[Capital Cohort Error]', formatError(appError));
    if (componentStack) {
      console.error('Component stack:', componentStack);
    }
  } catch {
    // Prevent error logger from crashing the app
    console.error('[Capital Cohort] Error logger itself failed');
  }
}
