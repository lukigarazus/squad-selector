import { observable, computed } from "mobx";
import {
  sync,
  syncInRoom,
  SharedState,
  syncable,
  shareableState,
  ExecutionSide,
  generateID,
  NoIntantiateEmit,
} from "mobx-websocket";
import { IEmitter } from "mobx-websocket/dist/types";

// class RoomModel {
//   private usedPlayers = new ObservableSet<string>();

//   public turn?: RoomMemberModel;
//   public participantsMap = new ObservableMap<UserModel, RoomMemberModel>();

//   constructor(public name: string) {}

//   public hasPlayer = (name: string) => {
//     return this.usedPlayers.has(name);
//   };

//   public addPlayer = (name: string) => {
//     this.usedPlayers.add(name);
//   };

//   public addParticipants = (participants: UserModel[]) => {
//     participants.forEach(this.addParticipant);
//   };

//   public addParticipant = (participant: UserModel) => {
//     if (!this.participantsMap.has(participant)) {
//       this.participantsMap.set(participant, new RoomMemberModel(participant));
//       participant.setRoom(this);
//     }
//   };

//   public deleteParticipant = (participant: UserModel) => {
//     if (this.participantsMap.has(participant)) {
//       this.participantsMap.delete(participant);
//       participant.setRoom(undefined);
//     }
//   };

//   public setTurn = (user: UserModel) => {
//     const participant = this.turn;
//     if (participant) participant.hasTurn = false;
//     const newParticipant = this.participantsMap.get(user);
//     if (newParticipant) {
//       newParticipant.hasTurn = true;
//       this.turn = newParticipant;
//     }
//   };

//   @computed
//   public get participants() {
//     return Array.from(this.participantsMap.values()) as RoomMemberModel[];
//   }
// }

@shareableState
export class RoomMemberModel extends SharedState {
  @observable
  public playersSet = new Set();

  @syncable()
  public hasTurn = false;

  public user?: UserModel;

  constructor(args: { userId: string; emitter: IEmitter }) {
    super({ id: args.userId, emitter: args.emitter });
    const user = UserModel.instances[args.userId];

    if (user) this.user = user;
  }

  @computed
  public get players() {
    return Array.from(this.playersSet) as string[];
  }
}
@shareableState
export class UserModel extends SharedState {
  @syncable()
  public active = true;

  public socketId: string;

  public timeout: number | void = undefined;

  @syncable()
  public roomId: string | void = undefined;

  constructor({ socketId, ...args }: any) {
    super({ ...args });
    this.socketId = socketId;
  }
}
@shareableState
export class RoomModel extends SharedState {
  public getSyncStateObject = () => {
    return { members: Object.values(this.members).map((member) => member.id) };
  };

  public handleSyncStateObject = (obj: any) => {
    obj.members.forEach((id: any) => {
      if (!this.members[id]) {
        this.addUser(id);
      }
    });
  };

  @observable
  public members: Record<string, RoomMemberModel> = {};

  @sync()
  public addUser(id: string) {
    const roomMember = new RoomMemberModel({
      userId: id,
      emitter: this.emitter,
      // @ts-ignore
      [NoIntantiateEmit]: true,
    });
    this.members[id] = roomMember;
    UserModel.instances[id].roomId = this.id;
  }

  @sync()
  public deleteRoomMember(id: string) {
    const user = this.members[id].user;
    if (user) {
      delete this.members[id];
      user.roomId = undefined;
    }
  }
}

interface ISyncObject {
  users: string[];
  rooms: string[];
}

@shareableState
export class MainAppModel extends SharedState {
  public id = "main";

  public getSyncStateObject = (Constructor: any): ISyncObject => {
    return {
      users: Object.keys(this.users),
      rooms: Object.keys(this.rooms),
    };
  };

  public handleSyncStateObject = (object: ISyncObject) => {
    object.users.forEach((userId) => {
      if (!this.users[userId]) {
        this.createUser(userId);
      }
    });
    object.rooms.forEach((roomId) => {
      if (!this.rooms[roomId]) {
        this._createRoom(roomId);
      }
    });
  };

  @observable
  public users: Record<string, UserModel> = {};

  @computed
  get usersCount() {
    return Object.keys(this.users).length;
  }

  @observable
  public rooms: Record<string, RoomModel> = {};

  public createRoom() {
    this._createRoom(generateID());
  }

  @sync()
  public _createRoom(id: string) {
    this.rooms[id] = new RoomModel({ id, emitter: this.emitter });
  }

  @sync()
  public createUser(id: string, socketId?: string) {
    console.log("CREATE USER");
    if (!this.users[id])
      this.users[id] = new UserModel({
        id,
        emitter: this.emitter,
        [NoIntantiateEmit]: true,
      });
    else {
      if (!this.users[id].active) {
        this.users[id].active = true;
        // @ts-ignore
        clearTimeout(this.users[id].timeout);
      } else if (socketId) {
        this.emitter.emitToUser(socketId, "username taken");
        this.oneTimeSyncDisabledOn();
      }
    }
  }

  @sync()
  public deleteUser(id: string) {
    delete this.users[id];
  }
}

const classes = [MainAppModel, RoomModel, UserModel, RoomMemberModel];

export { classes };
