import {
  AtomicComponent,
  createStatemachineComponent,
  OneWayEvent,
  RaiseEventCallBack,
  StateMachine,
  StateMachineState,
} from "@sorrir/framework";
import { EventTypesIntern } from "./events";

enum ParkingManagementStates {
  IDLE = "IDLE",
}

type ParkingManagementState = undefined;

export enum ParkingManagementPorts {
  FROM_DSB = "FROM_DSB",
  TO_DSB = "TO_DSB",
}

const sm: StateMachine<
  ParkingManagementStates,
  ParkingManagementState,
  EventTypesIntern,
  ParkingManagementPorts
> = {
  transitions: [
    {
      sourceState: ParkingManagementStates.IDLE,
      targetState: ParkingManagementStates.IDLE,
      event: [
        "oneway",
        EventTypesIntern.CC_CARD_REQUEST,
        ParkingManagementPorts.FROM_DSB,
      ],
      action: (
        myState: ParkingManagementState,
        raiseEvent: RaiseEventCallBack<
          EventTypesIntern,
          ParkingManagementPorts
        >,
        event?: OneWayEvent<EventTypesIntern, ParkingManagementPorts>
      ) => {
        raiseEvent({
          eventClass: "oneway",
          type: EventTypesIntern.OPEN,
          port: ParkingManagementPorts.TO_DSB,
        });

        return undefined;
      },
    },
    {
      sourceState: ParkingManagementStates.IDLE,
      targetState: ParkingManagementStates.IDLE,
      event: [
        "oneway",
        EventTypesIntern.LICENSE_PLATE_REQUEST,
        ParkingManagementPorts.FROM_DSB,
      ],
      action: (
        myState: ParkingManagementState,
        raiseEvent: RaiseEventCallBack<
          EventTypesIntern,
          ParkingManagementPorts
        >,
        event?: OneWayEvent<EventTypesIntern, ParkingManagementPorts>
      ) => {
        raiseEvent({
          eventClass: "oneway",
          type: EventTypesIntern.OPEN,
          port: ParkingManagementPorts.TO_DSB,
        });

        return undefined;
      },
    },
  ],
};

export const parkingManagement: AtomicComponent<
  EventTypesIntern,
  ParkingManagementPorts
> = createStatemachineComponent(
  [
    {
      name: ParkingManagementPorts.FROM_DSB,
      eventTypes: [
        EventTypesIntern.CC_CARD_REQUEST,
        EventTypesIntern.LICENSE_PLATE_REQUEST,
      ],
      direction: "in",
    },
    {
      name: ParkingManagementPorts.TO_DSB,
      eventTypes: [EventTypesIntern.OPEN],
      direction: "out",
    },
  ],
  sm,
  "parkingManagement"
);

export const parkingManagementStartState: StateMachineState<
  ParkingManagementStates,
  ParkingManagementState,
  EventTypesIntern,
  ParkingManagementPorts
> = {
  state: {
    fsm: ParkingManagementStates.IDLE,
    my: undefined,
  },
  events: [],
  tsType: "State",
};
