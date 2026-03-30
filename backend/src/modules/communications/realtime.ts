import { Response } from 'express';
import { CommunicationActorContext } from './types';

type CommunicationEventPayload = {
  at: string;
  source: string;
  conversationId?: string;
  messageId?: string;
  unreadConversations?: number;
};

const STREAM_RETRY_MS = 5000;
const HEARTBEAT_INTERVAL_MS = 25000;
const clientsByActor = new Map<string, Set<Response>>();

function actorKey(actor: Pick<CommunicationActorContext, 'ownerId' | 'actorType' | 'actorRef'>) {
  return `${actor.ownerId}:${actor.actorType}:${actor.actorRef}`;
}

function getActorClients(key: string) {
  let clients = clientsByActor.get(key);
  if (!clients) {
    clients = new Set<Response>();
    clientsByActor.set(key, clients);
  }
  return clients;
}

function removeClient(key: string, response: Response) {
  const clients = clientsByActor.get(key);
  if (!clients) return;
  clients.delete(response);
  if (!clients.size) {
    clientsByActor.delete(key);
  }
}

function writeEvent(response: Response, event: string, payload: CommunicationEventPayload) {
  if (response.writableEnded || response.destroyed) {
    return false;
  }
  response.write(`event: ${event}\n`);
  response.write(`data: ${JSON.stringify(payload)}\n\n`);
  return true;
}

function broadcast(key: string, event: string, payload: CommunicationEventPayload) {
  const clients = clientsByActor.get(key);
  if (!clients?.size) return;
  for (const response of clients) {
    if (!writeEvent(response, event, payload)) {
      removeClient(key, response);
    }
  }
}

export function openCommunicationsStream(actor: CommunicationActorContext, response: Response) {
  const key = actorKey(actor);
  response.status(200);
  response.setHeader('Content-Type', 'text/event-stream');
  response.setHeader('Cache-Control', 'no-cache, no-transform');
  response.setHeader('Connection', 'keep-alive');
  response.setHeader('X-Accel-Buffering', 'no');
  response.flushHeaders();
  response.write(`retry: ${STREAM_RETRY_MS}\n\n`);

  getActorClients(key).add(response);
  writeEvent(response, 'connected', {
    at: new Date().toISOString(),
    source: 'communications.stream'
  });

  const heartbeat = setInterval(() => {
    if (!writeEvent(response, 'ping', { at: new Date().toISOString(), source: 'communications.heartbeat' })) {
      clearInterval(heartbeat);
      removeClient(key, response);
    }
  }, HEARTBEAT_INTERVAL_MS);

  return () => {
    clearInterval(heartbeat);
    removeClient(key, response);
    if (!response.writableEnded) {
      response.end();
    }
  };
}

export function notifyCommunicationsUpdated(
  actors: Array<Pick<CommunicationActorContext, 'ownerId' | 'actorType' | 'actorRef'>>,
  event: 'conversation-created' | 'message-created' | 'messages-read' | 'conversation-closed' | 'conversation-reopened',
  payload: Omit<CommunicationEventPayload, 'at'>
) {
  const seen = new Set<string>();
  for (const actor of actors) {
    const key = actorKey(actor);
    if (seen.has(key)) continue;
    seen.add(key);
    broadcast(key, event, {
      at: new Date().toISOString(),
      ...payload
    });
  }
}
