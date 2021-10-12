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
import { EventTypesExtern, EventTypesIntern } from "./events";

enum DsbControllerStates {
  IDLE = "IDLE",
  CAR_DETECTED = "CAR_DETECTED",
  PROCESSING_CREDENTIALS = "PROCESSING_CREDENTIALS",
  WAITING_FOR_CAR_TO_ENTER = "WAITING_FOR_CAR_TO_ENTER",
}

type DsbControllerState = undefined;

export enum DsbControllerPorts {
  FROM_CC_READER = "FROM_CC_READER",
  FROM_PRESENCE_DETECTION = "FROM_PRESENCE_DETECTION",
  TO_BARRIER = "TO_BARRIER",
  TO_DISPLAY = "TO_DISPLAY",
  FROM_PRS = "FROM_PRS",
  TO_PRS = "TO_PRS",
  FROM_PARKING_MANAGEMENT = "FROM_PARKING_MANAGEMENT",
  TO_PARKING_MANAGEMENT = "TO_PARKING_MANAGEMENT",
  FROM_BARRIER_STATUS = "FROM_BARRIER_STATUS",
}

const sm: StateMachine<
  DsbControllerStates,
  DsbControllerState,
  EventTypesIntern | EventTypesExtern,
  DsbControllerPorts
> = {
  transitions: [
    {
      sourceState: DsbControllerStates.IDLE,
      targetState: DsbControllerStates.CAR_DETECTED,
      event: [
        "oneway",
        EventTypesExtern.CAR_DETECTED,
        DsbControllerPorts.FROM_PRESENCE_DETECTION,
      ],
      action: (myState, raiseEvent) => {
        raiseEvent({
          type: EventTypesExtern.PR_REQUEST,
          port: DsbControllerPorts.TO_PRS,
        });
        return undefined;
      }, // todo: implement request to PRS in the near future
    },
    {
      sourceState: DsbControllerStates.CAR_DETECTED,
      targetState: DsbControllerStates.PROCESSING_CREDENTIALS,
      event: [
        "oneway",
        EventTypesExtern.CC_CARD_DETECTED,
        DsbControllerPorts.FROM_CC_READER,
      ],
      action: (myState, raiseEvent, event) => {
        raiseEvent({
          ...event,
          type: EventTypesIntern.CC_CARD_REQUEST,
          port: DsbControllerPorts.TO_PARKING_MANAGEMENT,
        } as Event<any, any>);
        return undefined;
      },
    },
    {
      sourceState: DsbControllerStates.CAR_DETECTED,
      targetState: DsbControllerStates.PROCESSING_CREDENTIALS,
      event: [
        "oneway",
        EventTypesExtern.PLATE_DETECTED,
        DsbControllerPorts.FROM_PRS,
      ],
      action: (
        myState: DsbControllerState,
        raiseEvent: RaiseEventCallBack<
          EventTypesIntern | EventTypesExtern,
          DsbControllerPorts
        >,
        event?: OneWayEvent<
          EventTypesIntern | EventTypesExtern,
          DsbControllerPorts
        >
      ) => {
        raiseEvent({
          ...event,
          eventClass: "oneway",
          type: EventTypesIntern.LICENSE_PLATE_REQUEST,
          port: DsbControllerPorts.TO_PARKING_MANAGEMENT,
        } as EventWithoutID<any, any>);
        return undefined;
      },
    },
    {
      sourceState: DsbControllerStates.PROCESSING_CREDENTIALS,
      targetState: DsbControllerStates.WAITING_FOR_CAR_TO_ENTER,
      event: [
        "oneway",
        EventTypesIntern.OPEN,
        DsbControllerPorts.FROM_PARKING_MANAGEMENT,
      ],
      action: (myState, raiseEvent, event) => {
        raiseEvent({
          eventClass: "oneway",
          type: EventTypesExtern.BARRIER_CONTROL,
          port: DsbControllerPorts.TO_BARRIER,
          payload: "OPEN",
        } as EventWithoutID<any, any>);
        return undefined;
      },
    },
    {
      sourceState: DsbControllerStates.CAR_DETECTED,
      targetState: DsbControllerStates.IDLE,
      event: [
        "oneway",
        EventTypesExtern.NOTHING,
        DsbControllerPorts.FROM_PRESENCE_DETECTION,
      ],
      action: (myState) => undefined,
    },
    {
      sourceState: DsbControllerStates.WAITING_FOR_CAR_TO_ENTER,
      targetState: DsbControllerStates.IDLE,
      event: [
        "oneway",
        EventTypesExtern.NOTHING,
        DsbControllerPorts.FROM_PRESENCE_DETECTION,
      ],
      action: (
        myState: DsbControllerState,
        raiseEvent: RaiseEventCallBack<
          EventTypesIntern | EventTypesExtern,
          DsbControllerPorts
        >,
        event?: OneWayEvent<
          EventTypesIntern | EventTypesExtern,
          DsbControllerPorts
        >
      ) => {
        raiseEvent({
          eventClass: "oneway",
          type: EventTypesExtern.BARRIER_CONTROL,
          port: DsbControllerPorts.TO_BARRIER,
          payload: "CLOSE",
        } as EventWithoutID<any, any>);
        return undefined;
      },
    },
  ],
};

export const dsbController: AtomicComponent<
  EventTypesIntern | EventTypesExtern,
  DsbControllerPorts
> = createStatemachineComponent(
  [
    {
      name: DsbControllerPorts.FROM_CC_READER,
      eventTypes: Object.values(EventTypesExtern),
      direction: "in",
    },
    {
      name: DsbControllerPorts.FROM_PRS,
      eventTypes: Object.values(EventTypesExtern),
      direction: "in",
    },
    {
      name: DsbControllerPorts.TO_PRS,
      eventTypes: Object.values(EventTypesExtern),
      direction: "out",
    },
    {
      name: DsbControllerPorts.TO_BARRIER,
      eventTypes: Object.values(EventTypesExtern),
      direction: "out",
    },
    {
      name: DsbControllerPorts.FROM_PRESENCE_DETECTION,
      eventTypes: Object.values(EventTypesExtern),
      direction: "in",
    },
    {
      name: DsbControllerPorts.FROM_BARRIER_STATUS,
      eventTypes: Object.values(EventTypesExtern),
      direction: "in",
    },
    {
      name: DsbControllerPorts.FROM_PARKING_MANAGEMENT,
      eventTypes: Object.values(EventTypesIntern),
      direction: "in",
    },
    {
      name: DsbControllerPorts.TO_PARKING_MANAGEMENT,
      eventTypes: Object.values(EventTypesIntern),
      direction: "out",
    },
  ],
  sm,
  "dsbController"
);

export const dsbControllerStartState: StateMachineState<
  DsbControllerStates,
  DsbControllerState,
  EventTypesIntern | EventTypesExtern,
  DsbControllerPorts
> = {
  state: {
    fsm: DsbControllerStates.IDLE,
    my: undefined,
  },
  events: [],
  tsType: "State",
};
