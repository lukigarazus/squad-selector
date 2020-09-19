import SharedState from "./sharedState";
import { SyncedChange, ISE } from "./constants";

export const syncable = <T extends SharedState>(
  target: T,
  property: keyof T
) => {
  // @ts-ignore
  target.constructor.sharedKeys.push(property);
};

export const syncableInRoom = <T extends SharedState>(
  target: T,
  property: keyof T
) => {
  // @ts-ignore
  target.constructor.roomSharedKeys.push(property);
};

export const syncableInRooms = <T extends SharedState>(
  target: T,
  property: keyof T
) => {
  // @ts-ignore
  target.constructor.roomsSharedKeys.push(property);
};

const baseSyncMethod = (f: Function) => <T extends SharedState>(
  target: T,
  property: keyof T,
  propertyDescriptor: PropertyDescriptor
) => {
  if (typeof target[property] !== "function") {
    throw new Error(
      "Cannot use this decorator on a property that is not a function: " +
        property
    );
  }
  const old = target[property];
  propertyDescriptor.value = function (...args: any) {
    // @ts-ignore
    if (this.syncEnabled) {
      f.bind(this)(target, property, ...args);
    }
    // @ts-ignore
    old.bind(this)(...args);
  };
};

/**
 * Emit to everyone
 */
export const sync = baseSyncMethod(function <T extends SharedState>(
  _target: T,
  property: keyof T,
  ...args: any
) {
  // @ts-ignore
  if (this.emitter) {
    // @ts-ignore
    this.emitter.emit(ISE.Change, {
      property,
      arguments: args,
      // @ts-ignore
      id: this.id,
      // @ts-ignore
      className: this.constructor.name,
    });
  }
});

/**
 * Emit to members of one, specified room
 */
export const syncInRoom = (room: string) =>
  baseSyncMethod(function <T extends SharedState>(
    _target: T,
    property: string,
    ...args: any
  ) {
    // @ts-ignore
    if (this.emitter) {
      //@ts-ignore
      this.emitter.emitToRoom(room, ISE.Change, { property, arguments: args });
    }
  });

/**
 * Emit to members of all rooms the user is in
 */
export const syncInRooms = baseSyncMethod(function <T extends SharedState>(
  _target: T,
  property: string,
  ...args: any
) {
  // @ts-ignore
  if (this.emitter) {
    //@ts-ignore
    this.emitter.emitToAllUserRooms(ISE.Change, {
      property,
      arguments: args,
    });
  }
});
