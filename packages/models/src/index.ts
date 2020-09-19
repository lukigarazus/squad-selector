import { observable } from "mobx";
import { sync, syncInRoom, SharedState, syncable } from "./mobxWebsocket";

// class RoomMemberModel {
//   public playersSet = new ObservableSet<string>();
//   public hasTurn = false;

//   constructor(public user: UserModel) {}

//   @computed
//   public get players() {
//     return Array.from(this.playersSet) as string[];
//   }
// }

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

// class UserModel {
//   public room: RoomModel | void = undefined;
//   public active: boolean = true;

//   constructor(public name: string) {}

//   public setActive = (active: boolean) => {
//     this.active = active;
//   };

//   public setRoom = (room: RoomModel | void) => {
//     this.room = room;
//   };
// }

// export enum MessageEnum {
//   DeleteUserModel,
// }

// class AppModel {
//   @observable
//   public users = new ObservableMap<string, UserModel>();

//   @observable
//   public rooms = new ObservableMap<string, RoomModel>();

//   public emit?: (channel: string, data: any) => void;

//   constructor(emit?: (channel: string, data: any) => void) {
//     this.emit = emit;
//   }

//   public deleteUser(name: string) {
//     const userObj = this.users.get(name);
//     this.users.delete(name);
//     if (userObj && userObj.room) {
//       const roomObj = this.rooms.get(userObj.room.name);
//       roomObj && roomObj.deleteParticipant(userObj);
//     }
//   }

//   public addUser = (name: string) => {
//     if (this.users.has(name)) return { error: "Username taken" };
//     const userObj = new UserModel(name);
//     this.users.set(name, userObj);
//     if (this.emit) this.emit("add user", name);
//     return userObj;
//   };

//   public addRoom(roomName: string) {
//     this.rooms.set(roomName, new RoomModel(roomName));
//   }

//   public deleteRoom(roomName: string) {
//     this.rooms.delete(roomName);
//   }

//   public addUserToRoom(roomName: string, user: UserModel) {
//     const roomObj = this.rooms.get(roomName);
//     roomObj && roomObj.addParticipant(user);
//   }

//   public disconnectUser(name: string) {
//     const userObj = this.users.get(name);
//     userObj && userObj.setActive(false);
//   }
// }

// export { RoomModel, RoomMemberModel, AppModel, UserModel };

export class Test extends SharedState {
  static syncState = (
    stateToBeSynced: { [key: string]: any },
    instance: Test
  ) => {
    console.log("HERE");
    instance.setTest(stateToBeSynced.test);
  };

  @syncable
  @observable
  public test = 2;
  @observable
  public roomTest = 2;

  @sync
  public setTest(v: number) {
    this.test = v;
  }

  @syncInRoom("testRoom")
  public setRoomTest(v: number) {
    console.log("SET ROOM");
    this.roomTest = v;
  }
}

export class App extends SharedState {}

const classes = [Test];

export { classes };
