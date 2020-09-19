export interface IChangeMethod<T> {
  property: keyof T;
  arguments: any[];
  className: string;
  id: string;
}

export interface IClientRoomChange<T> {
  room: string;
  channel: string;
  change: IChangeMethod<T>;
}

export interface IEmitter {
  emit: (message: string, data: any) => void;
  emitToRoom: (room: string, message: string, data: any) => void;
  emitToAllUserRooms: (message: string, data: any) => void;
}

export interface IInstantiate {
  id: string;
  className: string;
  arguments: any[];
}

export interface IServerAccept {
  id: string;
  className: string;
}

export interface ISyncState {
  id: string;
  className: string;
  syncStateObject: { [key: string]: any };
}
