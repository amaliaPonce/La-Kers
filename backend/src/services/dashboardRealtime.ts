import { Response } from 'express';

type DashboardStreamPayload = {
  at: string;
  source?: string;
};

const STREAM_RETRY_MS = 5000;
const HEARTBEAT_INTERVAL_MS = 25000;
const clientsByOwner = new Map<string, Set<Response>>();

function getOwnerClients(ownerId: string) {
  let clients = clientsByOwner.get(ownerId);
  if (!clients) {
    clients = new Set<Response>();
    clientsByOwner.set(ownerId, clients);
  }
  return clients;
}

function removeClient(ownerId: string, response: Response) {
  const clients = clientsByOwner.get(ownerId);
  if (!clients) return;

  clients.delete(response);
  if (!clients.size) {
    clientsByOwner.delete(ownerId);
  }
}

function writeEvent(response: Response, event: string, payload: DashboardStreamPayload) {
  if (response.writableEnded || response.destroyed) {
    return false;
  }

  response.write(`event: ${event}\n`);
  response.write(`data: ${JSON.stringify(payload)}\n\n`);
  return true;
}

function broadcastToOwner(ownerId: string, event: string, payload: DashboardStreamPayload) {
  const clients = clientsByOwner.get(ownerId);
  if (!clients?.size) return;

  for (const response of clients) {
    const written = writeEvent(response, event, payload);
    if (!written) {
      removeClient(ownerId, response);
    }
  }
}

export function openDashboardStream(ownerId: string, response: Response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/event-stream');
  response.setHeader('Cache-Control', 'no-cache, no-transform');
  response.setHeader('Connection', 'keep-alive');
  response.setHeader('X-Accel-Buffering', 'no');
  response.flushHeaders();
  response.write(`retry: ${STREAM_RETRY_MS}\n\n`);

  getOwnerClients(ownerId).add(response);
  writeEvent(response, 'connected', { at: new Date().toISOString(), source: 'dashboard.stream' });

  const heartbeat = setInterval(() => {
    const written = writeEvent(response, 'ping', { at: new Date().toISOString(), source: 'dashboard.heartbeat' });
    if (!written) {
      clearInterval(heartbeat);
      removeClient(ownerId, response);
    }
  }, HEARTBEAT_INTERVAL_MS);

  return () => {
    clearInterval(heartbeat);
    removeClient(ownerId, response);
    if (!response.writableEnded) {
      response.end();
    }
  };
}

export function notifyDashboardUpdated(ownerId: string, source: string) {
  broadcastToOwner(ownerId, 'dashboard-update', {
    at: new Date().toISOString(),
    source
  });
}

export function notifyAllDashboardsUpdated(source: string) {
  const payload = {
    at: new Date().toISOString(),
    source
  };

  for (const ownerId of clientsByOwner.keys()) {
    broadcastToOwner(ownerId, 'dashboard-update', payload);
  }
}
