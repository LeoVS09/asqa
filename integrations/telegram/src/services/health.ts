import http from 'http';
import { createTerminus, HealthCheckError } from '@godaddy/terminus';
import * as util from 'util';
import { HealthDependency } from 'src/interfaces';


export const setupHealthCheck = ({server, dependencies}: {server: http.Server, dependencies: Array<HealthDependency>}) => 
  addHealthCheckHooks(server, {
    isReady: async () => {
      const results = await Promise.all(dependencies.map(d => d.isReady()));

      for (const result of results) 
        if(!result)
          return false;

      return true;      
    },

    onShutdownSignal: async () => {
      for (const dependency of dependencies) 
        await dependency.stop();

      const closeServer = util.promisify(server.close)
      await closeServer()
    },
  });



export interface HealthCheckHooks {
  isReady: () => Promise<boolean>;
  onShutdownSignal: () => Promise<void>;
}

function addHealthCheckHooks(
  server: http.Server,
  { isReady, onShutdownSignal }: HealthCheckHooks,
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
