import { IEmitter, IServerAccept } from "./types";
import { ISE, SyncedChange } from "./constants";

export const generateID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// const instanceMap: { [key: string]: any } = {};

/**
 * Base class to extend
 */
export default class SharedState {
  static isSyncedInstantiate = (args: any) => args[SyncedChange];
  static instances: { [key: string]: SharedState[] } = {};
  static sharedKeys: string[] = [];
  static roomSharedKeys: string[] = [];
  static roomsSharedKeys: string[] = [];
  static syncState = (
    stateToBeSynced: { [key: string]: any },
    instance: any
  ) => {
    if (stateToBeSynced)
      Object.keys(stateToBeSynced).forEach((key) => {
        instance[key] = stateToBeSynced[key];
      });
  };

  private syncEnabled = true;
  private syncOn = () => (this.syncEnabled = true);
  private syncOff = () => (this.syncEnabled = false);

  public emitter: IEmitter;
  public id: string;
  public reactions: (() => void)[] = [];

  constructor({ emitter, id, ...args }: { emitter: IEmitter; id: string }) {
    this.emitter = emitter;
    // @ts-ignore
    if (!this.id) this.id = id;
    if (SharedState.isSyncedInstantiate(args)) {
      console.log("SYNC INSTA");
    } else {
      const className = this.constructor.name;

      setTimeout(() => {
        try {
          // @ts-ignore
          window;
          if (this.emitter) {
            console.log("EMIT INSTA REQ");
            this.emitter.emit(ISE.ClientInstantiated, {
              className,
              id: this.id,
              arguments: args,
            });
          }
        } catch {
          console.log("CAUGHT", emitter);
          if (this.emitter) {
            this.emitter.emit(ISE.ServerInstantiated, {
              className,
              id: this.id,
              arguments: args,
            });
          }
        }
      }, 0);
    }
    // @ts-ignore This is kinda hacky but whatever
    this.constructor.instances[this.id] = this;
  }

  public changeEmitter(emitter: IEmitter) {
    this.emitter = emitter;
  }

  public dispose() {
    this.reactions.forEach((r) => r());
  }
}
