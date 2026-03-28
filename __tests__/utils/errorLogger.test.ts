import { logError, formatError, createAppError } from '../../utils/errorLogger';
import { AppError } from '../../types';

describe('createAppError', () => {
  it('returns AppError shape from Error object', () => {
    const error = new Error('Test error');
    const appError = createAppError(error);
    expect(appError).toHaveProperty('message', 'Test error');
    expect(appError).toHaveProperty('timestamp');
    expect(typeof appError.timestamp).toBe('string');
  });

  it('accepts optional context string', () => {
    const appError = createAppError(new Error('oops'), undefined, 'dashboard');
    expect(appError.context).toBe('dashboard');
  });

  it('timestamp is a valid ISO string', () => {
    const appError = createAppError(new Error('test'));
    expect(() => new Date(appError.timestamp)).not.toThrow();
    expect(new Date(appError.timestamp).getTime()).not.toBeNaN();
  });

  it('handles non-Error objects gracefully', () => {
    const appError = createAppError(
      'something weird happened' as unknown as Error,
    );
    expect(appError.message).toMatch(/something weird/i);
  });
});

describe('formatError', () => {
  it('returns readable string with message and timestamp', () => {
    const appError: AppError = {
      message: 'Test error',
      timestamp: '2024-01-15T10:00:00.000Z',
      context: 'settings',
    };
    const formatted = formatError(appError);
    expect(formatted).toContain('Test error');
    expect(formatted).toMatch(/1.15.2024|2024.01.15/);
    expect(formatted).toContain('settings');
  });

  it('handles missing context gracefully', () => {
    const appError: AppError = {
      message: 'error',
      timestamp: new Date().toISOString(),
    };
    expect(() => formatError(appError)).not.toThrow();
  });
});

describe('logError', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('calls console.error with formatted error', () => {
    const error = new Error('something failed');
    logError(error);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('does not throw even when error is malformed', () => {
    // @ts-ignore
    expect(() => logError(null as unknown as Error)).not.toThrow();
  });

  it('includes context in log output when provided', () => {
    const error = new Error('context error');
    logError(error, undefined, 'expenses-screen');

    const wasContextFound = consoleSpy.mock.calls.some((call) =>
      call.some(
        (arg: unknown) => typeof arg === 'string' && arg.includes('expenses-screen'),
      ),
    );
    expect(wasContextFound).toBe(true);
  });
});
