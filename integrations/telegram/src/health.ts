import http from 'http';
import { createTerminus, HealthCheckError } from '@godaddy/terminus';

export interface HealthCHeckHooks {
  isReady: () => Promise<boolean>;
  onShutdownSignal: () => Promise<void>;
}

export function addHealthCheck(
  server: http.Server,
  { isReady, onShutdownSignal }: HealthCHeckHooks,
) {
  async function onHealthCheck() {
    // checks if the system is healthy, like the db connection is live
    // resolves, if health, rejects if not

    try {
      if (await isReady()) return;
    } catch (e) {
      throw new HealthCheckError('Error during health check', e);
    }

    throw new HealthCheckError('Health check failed', {});
  }

  async function onSignal() {
    console.log('server is starting cleanup');
    // start cleanup of resource, like databases or file descriptors
    await onShutdownSignal()
  }

  async function onShutdown() {
    console.log('cleanup finished, server is shutting down');
  }

  createTerminus(server, {
    signals: ['SIGTERM', 'SIGINT', 'SIGUSR2'],
    healthChecks: {
      '/is-ready': onHealthCheck,
      verbatim: true,
      __unsafeExposeStackTraces: true,
    },
    onSignal,
    onShutdown,
  });
}
