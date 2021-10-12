import {
  AtomicComponent,
  createStatemachineComponent,
  Event,
  EventWithoutID,
  OneWayEvent,
  RaiseEventCallBack,
  StateMachine,
  StateMachineState,
} from "@sorrir/framework";
import { EventTypesIntern, EventTypesExtern } from "../events";

enum BarrierStates {
  OPENED = "OPENED",
  CLOSED = "CLOSED",
}

type BarrierInternalState = {
  lastAction: number;
};

export enum BarrierPorts {
  FROM_DSB_CONTROL = "FROM_DSB_CONTROL",
  TO_BARRIER_MCU = "TO_BARRIER_MCU",
}

const sm: StateMachine<
  BarrierStates,
  BarrierInternalState,
  EventTypesIntern | EventTypesExtern,
  BarrierPorts
> = {
  transitions: [
    {
      // Open the Barrier by sending "OPEN" via MQTT to MCU
      sourceState: BarrierStates.CLOSED,
      targetState: BarrierStates.OPENED,
      event: ["oneway", EventTypesIntern.OPEN, BarrierPorts.FROM_DSB_CONTROL],
      action: (
        myState: BarrierInternalState,
        raiseEvent: RaiseEventCallBack<
          EventTypesExtern | EventTypesIntern,
          BarrierPorts
        >,
        event?: OneWayEvent<EventTypesExtern | EventTypesIntern, BarrierPorts>
      ) => {
        raiseEvent({
          eventClass: "oneway",
          type: EventTypesExtern.BARRIER_CONTROL,
          port: BarrierPorts.TO_BARRIER_MCU,
          action: "OPEN",
        } as EventWithoutID<any, any>);
        return { lastAction: Date.now() };
      },
    },
    {
      // Close the Barrier by sending "CLOSE" via MQTT to MCU
      sourceState: BarrierStates.OPENED,
      targetState: BarrierStates.CLOSED,
      condition: (myState) => myState.lastAction + 2000 <= Date.now(),
      action: (
        myState: BarrierInternalState,
        raiseEvent: RaiseEventCallBack<
          EventTypesExtern | EventTypesIntern,
          BarrierPorts
        >,
        event?: OneWayEvent<EventTypesExtern | EventTypesIntern, BarrierPorts>
      ) => {
        raiseEvent({
          eventClass: "oneway",
          type: EventTypesExtern.BARRIER_CONTROL,
          port: BarrierPorts.TO_BARRIER_MCU,
          action: "CLOSE",
        } as EventWithoutID<any, any>);
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
      name: BarrierPorts.FROM_DSB_CONTROL,
      eventTypes: Object.values(EventTypesIntern),
      direction: "in",
    },
    {
      name: BarrierPorts.TO_BARRIER_MCU,
      eventTypes: Object.values(EventTypesExtern),
      direction: "out",
    },
  ],
  sm,
  "barrier"
);

export const barrierStartState: StateMachineState<
  BarrierStates,
  BarrierInternalState,
  EventTypesIntern | EventTypesExtern,
  BarrierPorts
> = {
  state: {
    fsm: BarrierStates.CLOSED,
    my: {
      lastAction: 0,
    },
  },
  // todo: must this be filled as it was originally?
  events: [],
  tsType: "State",
};
