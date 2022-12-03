import type { BandeirantesEvents, BandeirantesSocket } from './types';

export function emitEvent<T extends keyof BandeirantesEvents<'emit'>>(
  eventName: T,
  socket: BandeirantesSocket,
  ...payload: Parameters<BandeirantesEvents<'emit'>[T]>
) {
  return socket.emit(eventName, ...payload);
}

export function onEvent<T extends keyof BandeirantesEvents<'listen'>>(
  eventName: T,
  socket: BandeirantesSocket,
  listener: BandeirantesEvents<'listen'>[T]
) {
  return socket.on<keyof BandeirantesEvents<'listen'>>(eventName, listener);
}