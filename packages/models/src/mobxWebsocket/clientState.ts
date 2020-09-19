import SocketIOClient from "socket.io-client";

import AgnosticState from "./agnosticState";
import SharedState from "./sharedState";
import {
  IClientRoomChange,
  IChangeMethod,
  IEmitter,
  IServerAccept,
  ISyncState,
} from "./types";
import { ISE, SyncedChange } from "./constants";

class ClientEmitter implements IEmitter {
  constructor(private socket: SocketIOClient.Socket) {}

  emit = this.socket.emit.bind(this.socket);

  emitToRoom = (room: string, channel: string, data: any) => {
    this.socket.emit(ISE.ChangeInRoom, {
      room,
      channel,
      change: data,
    } as IClientRoomChange<SharedState>);
  };

  emitToAllUserRooms = () => {};
}

/**
 * Client wrapper for SharedState
 */
export default class ClientState extends AgnosticState {
  emitter: ClientEmitter;

  constructor(public socket: SocketIOClient.Socket, classes: any[]) {
    super(classes);
    const emitter = new ClientEmitter(this.socket);
    this.emitter = emitter;

    this.socket.on(ISE.Change, (change: IChangeMethod<SharedState>) => {
      if (this.emitter) {
      }
      const instance = this.classes[change.className].instances[change.id];
      if (instance) {
        instance.syncOff();
        // @ts-ignore we know that this is a method
        instance[change.property](...change.arguments);
        instance.syncOn();
      }
    });

    this.socket.on(ISE.ServerAcceptedChange, (data: IServerAccept) => {
      if (data.id) {
      }
    });

    this.socket.on(ISE.ServerSyncState, (data: ISyncState) => {
      if (data.id) {
        const Constructor = this.classes[data.className];
        const clientInstance = Constructor.instances[data.id];
        Constructor.syncState(data.syncStateObject, clientInstance);
      }
    });
  }
}
