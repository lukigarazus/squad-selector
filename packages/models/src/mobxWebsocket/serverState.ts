import socketIO, { Socket } from "socket.io";
import AgnosticState from "./agnosticState";
import SharedState from "./sharedState";
import {
  IChangeMethod,
  IClientRoomChange,
  IEmitter,
  IInstantiate,
} from "./types";
import { ISE, SyncedChange } from "./constants";
import { generateID } from "./sharedState";

class ServerEmitter implements IEmitter {
  constructor(private io: socketIO.Server) {}

  emit = this.io.emit.bind(this.io);

  emitToRoom = (room: string, channel: string, data: any) => {
    this.io.to(room).emit(channel, data);
  };

  emitToAllUserRooms = (channel: string, data: any) => {
    this.io.emit(channel, data);
  };
}

/**
 * Server wrapper for SharedState
 */
export default class ServerState<T extends SharedState> extends AgnosticState {
  public emitter: ServerEmitter;
  public sockets: Set<Socket> = new Set();
  public rooms: { [key: string]: Set<Socket> } = {};
  public instances: { [key: string]: any } = {};

  constructor(ioObject: socketIO.Server, classes: any[]) {
    super(classes);

    ioObject.on("connection", (socket: Socket) => {
      this.sockets.add(socket);

      socket.on(ISE.Change, (change: IChangeMethod<T>) => {
        const instance = this.classes[change.className].instances[change.id];
        if (instance) {
          instance.syncOff();
          // @ts-ignore We know that this is a function
          instance[change.property](...change.arguments);
          instance.syncOn();
          socket.broadcast.emit(ISE.Change, change);
        }
      });

      socket.on(
        ISE.ChangeInRoom,
        (changeRoom: IClientRoomChange<SharedState>) => {
          socket
            .to(changeRoom.room)
            .broadcast.emit(ISE.Change, changeRoom.change);
        }
      );

      socket.on(ISE.ChangeInRooms, (change: IChangeMethod<SharedState>) => {
        Object.keys(socket.rooms).forEach((room) => {
          socket.to(room).broadcast.emit(ISE.Change, change);
        });
      });

      socket.on("disconnect", () => {
        this.sockets.delete(socket);
        Object.keys(socket.rooms).forEach((roomName) => {
          this.rooms[roomName].delete(socket);
        });
      });

      socket.on(ISE.ClientInstantiated, (data: IInstantiate) => {
        const Constructor = this.classes[data.className] as typeof SharedState;
        const serverInstance = this.classes[data.className].instances[data.id];
        if (serverInstance) {
          socket.emit(ISE.ServerAcceptedChange, {
            id: data.id,
            className: data.className,
          });
          socket.emit(ISE.ServerSyncState, {
            id: data.id,
            className: data.className,
            syncStateObject: [
              ...Constructor.sharedKeys,
              ...Constructor.roomSharedKeys,
              ...Constructor.roomsSharedKeys,
            ].reduce((acc: { [key: string]: any }, el) => {
              acc[el] = serverInstance[el];
              return acc;
            }, {}),
          });
        } else {
          const instance = new Constructor({
            ...data.arguments,
            emitter: this.emitter,
            id: data.id,
            // @ts-ignore
            [SyncedChange]: true,
          });
          this.classes[data.className].instances[data.id] = instance;
          this.instances[data.id] = instance;
          socket.emit(ISE.ServerAcceptedChange, {
            id: data.id,
            className: data.className,
          });
        }
      });
    });

    const emitter = new ServerEmitter(ioObject);
    this.emitter = emitter;
  }
}
