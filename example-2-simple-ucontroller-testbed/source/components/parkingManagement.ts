import {
  AtomicComponent,
  createStatemachineComponent,
  Event,
  EventWithoutID,
  RaiseEventCallBack,
  StateMachine,
  StateMachineState,
} from "@sorrir/framework";
import {
  AllEventTypes,
  EventTypesExtern,
  EventTypesIntern,
} from "./event-types";

// The states the ParkingManagement's state machine can be
enum ParkingManagementStates {
  AVAILABLE = "AVAILABLE",
  FULL = "FULL",
}

// Ports of ParkingManagement to other components.
// Naming convention: <FROM/TO>_<OTHER_COMPONENT_NAME>
export enum ParkingManagementPorts {
  FROM_BARRIER = "FROM_BARRIER",
  TO_SIGNAL_MCU = "TO_SIGNAL_MCU",
}

// In contrast to ParkingManagementStates (plural), this is the internal state or data state of the component.
// You can define entries of your choice that are passed from step to step
type ParkingManagementState = {
  readonly freeParkingSpaces: number;
  readonly totalParkingSpaces: number;
};

// The component's state machine is defined by its transitions
const sm: StateMachine<
  ParkingManagementStates,
  ParkingManagementState,
  EventTypesIntern | EventTypesExtern,
  ParkingManagementPorts
> = {
  transitions: [
    {
      // A car enters the garage and after that there are free spaces left.
      sourceState: ParkingManagementStates.AVAILABLE,
      targetState: ParkingManagementStates.AVAILABLE,
      event: [
        "oneway",
        EventTypesIntern.CAR_IN,
        ParkingManagementPorts.FROM_BARRIER,
      ],
      condition: (myState: ParkingManagementState) =>
        myState.freeParkingSpaces - 1 > 0,
      action: (
        myState: ParkingManagementState,
        raiseEvent: RaiseEventCallBack<AllEventTypes, ParkingManagementPorts>
      ) => {
        const updatedFreeParkingSpaces = myState.freeParkingSpaces - 1;

        raiseEvent({
          eventClass: "oneway",
          type: EventTypesExtern.LED_RED,
          port: ParkingManagementPorts.TO_SIGNAL_MCU,
          status: "OFF",
        } as EventWithoutID<any, any>);

        raiseEvent({
          eventClass: "oneway",
          type: EventTypesExtern.LED_GREEN,
          port: ParkingManagementPorts.TO_SIGNAL_MCU,
          status: "ON",
        } as EventWithoutID<any, any>);

        raiseEvent({
          eventClass: "oneway",
          type: EventTypesExtern.DISPLAY,
          port: ParkingManagementPorts.TO_SIGNAL_MCU,
          freeSpaces: updatedFreeParkingSpaces,
        } as EventWithoutID<any, any>);

        return {
          freeParkingSpaces: updatedFreeParkingSpaces,
          totalParkingSpaces: myState.totalParkingSpaces,
        };
      },
    },
    // A car enters the garage. After that, there are no free spaces left.
    {
      sourceState: ParkingManagementStates.AVAILABLE,
      targetState: ParkingManagementStates.FULL,
      event: [
        "oneway",
        EventTypesIntern.CAR_IN,
        ParkingManagementPorts.FROM_BARRIER,
      ],
      condition: (myState) => myState.freeParkingSpaces - 1 === 0,
      action: (
        myState: ParkingManagementState,
        raiseEvent: RaiseEventCallBack<AllEventTypes, ParkingManagementPorts>
      ) => {
        const updatedFreeParkingSpaces = myState.freeParkingSpaces - 1;

        raiseEvent({
          eventClass: "oneway",
          type: EventTypesExtern.LED_RED,
          port: ParkingManagementPorts.TO_SIGNAL_MCU,
          status: "ON",
        } as EventWithoutID<any, any>);

        raiseEvent({
          eventClass: "oneway",
          type: EventTypesExtern.LED_GREEN,
          port: ParkingManagementPorts.TO_SIGNAL_MCU,
          status: "OFF",
        } as EventWithoutID<any, any>);

        raiseEvent({
          eventClass: "oneway",
          type: EventTypesExtern.DISPLAY,
          port: ParkingManagementPorts.TO_SIGNAL_MCU,
          freeSpaces: updatedFreeParkingSpaces,
        } as EventWithoutID<any, any>);

        return {
          freeParkingSpaces: updatedFreeParkingSpaces,
          totalParkingSpaces: myState.totalParkingSpaces,
        };
      },
    },
    // A car leaves the full parking garage.
    {
      sourceState: ParkingManagementStates.FULL,
      targetState: ParkingManagementStates.AVAILABLE,
      event: [
        "oneway",
        EventTypesIntern.CAR_OUT,
        ParkingManagementPorts.FROM_BARRIER,
      ],
      action: (
        myState: ParkingManagementState,
        raiseEvent: RaiseEventCallBack<AllEventTypes, ParkingManagementPorts>
      ) => {
        const updatedFreeParkingSpaces = myState.freeParkingSpaces + 1;

        raiseEvent({
          eventClass: "oneway",
          type: EventTypesExtern.LED_RED,
          port: ParkingManagementPorts.TO_SIGNAL_MCU,
          status: "OFF",
        } as EventWithoutID<any, any>);

        raiseEvent({
          eventClass: "oneway",
          type: EventTypesExtern.LED_GREEN,
          port: ParkingManagementPorts.TO_SIGNAL_MCU,
          status: "ON",
        } as EventWithoutID<any, any>);

        raiseEvent({
          eventClass: "oneway",
          type: EventTypesExtern.DISPLAY,
          port: ParkingManagementPorts.TO_SIGNAL_MCU,
          freeSpaces: updatedFreeParkingSpaces,
        } as EventWithoutID<any, any>);

        return {
          freeParkingSpaces: updatedFreeParkingSpaces,
          totalParkingSpaces: myState.totalParkingSpaces,
        };
      },
    },
    // A car leaves the not full parking garage.
    {
      sourceState: ParkingManagementStates.AVAILABLE,
      targetState: ParkingManagementStates.AVAILABLE,
      event: [
        "oneway",
        EventTypesIntern.CAR_OUT,
        ParkingManagementPorts.FROM_BARRIER,
      ],
      condition: (myState: ParkingManagementState) =>
        myState.freeParkingSpaces + 1 <= myState.totalParkingSpaces,
      action: (
        myState: ParkingManagementState,
        raiseEvent: RaiseEventCallBack<AllEventTypes, ParkingManagementPorts>
      ) => {
        const updatedFreeParkingSpaces = myState.freeParkingSpaces + 1;

        raiseEvent({
          eventClass: "oneway",
          type: EventTypesExtern.LED_RED,
          port: ParkingManagementPorts.TO_SIGNAL_MCU,
          status: "OFF",
        } as EventWithoutID<any, any>);

        raiseEvent({
          eventClass: "oneway",
          type: EventTypesExtern.LED_GREEN,
          port: ParkingManagementPorts.TO_SIGNAL_MCU,
          status: "ON",
        } as EventWithoutID<any, any>);

        raiseEvent({
          eventClass: "oneway",
          type: EventTypesExtern.DISPLAY,
          port: ParkingManagementPorts.TO_SIGNAL_MCU,
          freeSpaces: updatedFreeParkingSpaces,
        } as EventWithoutID<any, any>);

        return {
          freeParkingSpaces: updatedFreeParkingSpaces,
          totalParkingSpaces: myState.totalParkingSpaces,
        };
      },
    },
  ],
};

export const parkingManagement: AtomicComponent<
  EventTypesIntern | EventTypesExtern,
  ParkingManagementPorts
> = createStatemachineComponent(
  [
    {
      name: ParkingManagementPorts.FROM_BARRIER,
      eventTypes: Object.values(EventTypesIntern),
      direction: "in",
    },
    {
      name: ParkingManagementPorts.TO_SIGNAL_MCU,
      eventTypes: Object.values(EventTypesExtern),
      direction: "out",
    },
  ],
  sm,
  "parkingManagement"
);

export const parkingManagementStartState: StateMachineState<
  ParkingManagementStates,
  ParkingManagementState,
  EventTypesExtern,
  ParkingManagementPorts
> = {
  state: {
    fsm: ParkingManagementStates.AVAILABLE,
    my: {
      totalParkingSpaces: 5,
      freeParkingSpaces: 5,
    },
  },
  // todo: must this be filled as it was originally?
  events: [],
  tsType: "State",
};
