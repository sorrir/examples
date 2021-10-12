import {
  EventTypesIntern,
  EventTypesExtern,
  AllEventTypes,
} from "./event-types";
import {
  AtomicComponent,
  createStatemachineComponent,
  OneWayEvent,
  RaiseEventCallBack,
  StateMachine,
  StateMachineState,
} from "@sorrir/framework";

enum BarrierStates {
  IDLE = "IDLE",
  CAR_ENTRY = "CAR_ENTRY",
}

export enum BarrierPorts {
  TO_PARKING_MANAGEMENT = "TO_PARKING_MANAGEMENT",
  FROM_BUTTON_MCU = "FROM_BUTTON_MCU",
}

type BarrierState = {
  lastAction: number;
};

const sm: StateMachine<
  BarrierStates,
  BarrierState,
  EventTypesIntern | EventTypesExtern,
  BarrierPorts
> = {
  transitions: [
    {
      sourceState: BarrierStates.IDLE,
      targetState: BarrierStates.CAR_ENTRY,
      event: [
        "oneway",
        EventTypesExtern.BUTTON_DOWN_PRESSED,
        BarrierPorts.FROM_BUTTON_MCU,
      ],
      action: (
        myState: BarrierState,
        raiseEvent: RaiseEventCallBack<AllEventTypes, BarrierPorts>,
        event?: OneWayEvent<AllEventTypes, BarrierPorts>
      ) => {
        raiseEvent({
          eventClass: "oneway",
          type: EventTypesIntern.CAR_OUT,
          port: BarrierPorts.TO_PARKING_MANAGEMENT,
        });
        return { lastAction: Date.now() };
      },
    },
    {
      sourceState: BarrierStates.IDLE,
      targetState: BarrierStates.CAR_ENTRY,
      event: [
        "oneway",
        EventTypesExtern.BUTTON_UP_PRESSED,
        BarrierPorts.FROM_BUTTON_MCU,
      ],
      action: (
        myState: BarrierState,
        raiseEvent: RaiseEventCallBack<AllEventTypes, BarrierPorts>,
        event?: OneWayEvent<AllEventTypes, BarrierPorts>
      ) => {
        raiseEvent({
          eventClass: "oneway",
          type: EventTypesIntern.CAR_IN,
          port: BarrierPorts.TO_PARKING_MANAGEMENT,
        });
        return { lastAction: Date.now() };
      },
    },
    {
      sourceState: BarrierStates.CAR_ENTRY,
      targetState: BarrierStates.IDLE,
      condition: (myState: BarrierState) =>
        myState.lastAction + 1000 <= Date.now(),
      action: (myState: BarrierState) => {
        return myState;
      },
    },
  ],
};

export const barrier: AtomicComponent<
  EventTypesIntern | EventTypesExtern,
  BarrierPorts
> = createStatemachineComponent(
  [
    {
      name: BarrierPorts.TO_PARKING_MANAGEMENT,
      eventTypes: Object.values(EventTypesIntern),
      direction: "out",
    },
    {
      name: BarrierPorts.FROM_BUTTON_MCU,
      eventTypes: Object.values(EventTypesExtern),
      direction: "in",
    },
  ],
  sm,
  "barrier"
);

export const barrierStartState: StateMachineState<
  BarrierStates,
  BarrierState,
  EventTypesIntern | EventTypesExtern,
  BarrierPorts
> = {
  state: {
    fsm: BarrierStates.IDLE,
    my: {
      lastAction: 0,
    },
  },
  // todo: must this be filled as it was originally?
  events: [],
  tsType: "State",
};
