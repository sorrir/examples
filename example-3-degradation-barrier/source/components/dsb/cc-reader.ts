import {
  AtomicComponent,
  createStatemachineComponent,
  Event,
  EventWithoutID,
  StateMachine,
  StateMachineState,
} from "@sorrir/framework";
import { CreditCardEvent, EventTypesExtern, EventTypesIntern } from "../events";

enum CcReaderStates {
  IDLE = "IDLE",
}

export enum CcReaderPorts {
  FROM_CC_READER_MCU = "FROM_CC_READER_MCU",
  TO_DSB_CONTROLLER = "TO_DSB_CONTROLLER",
}

const sm: StateMachine<
  CcReaderStates,
  undefined,
  EventTypesExtern | EventTypesIntern,
  CcReaderPorts
> = {
  transitions: [
    {
      sourceState: CcReaderStates.IDLE,
      targetState: CcReaderStates.IDLE,
      event: [
        "oneway",
        EventTypesExtern.CC_CARD_DETECTED,
        CcReaderPorts.FROM_CC_READER_MCU,
      ],
      action: (myState, raiseEvent, event) => {
        const ccEvent = event as CreditCardEvent<
          EventTypesExtern,
          CcReaderPorts
        >;

        if (ccEvent.param?.ccNumber && ccEvent.param?.ccNumber !== "") {
          raiseEvent({
            eventClass: "oneway",
            type: EventTypesIntern.CC_CARD_REQUEST,
            port: CcReaderPorts.TO_DSB_CONTROLLER,
            param: {
              ccNumber: ccEvent.param?.ccNumber,
            },
          } as EventWithoutID<any, any>);
        }
        return undefined;
      },
    },
  ],
};

export const ccReader: AtomicComponent<
  EventTypesExtern | EventTypesIntern,
  CcReaderPorts
> = createStatemachineComponent(
  [
    {
      name: CcReaderPorts.FROM_CC_READER_MCU,
      eventTypes: [EventTypesExtern.CC_CARD_DETECTED],
      direction: "in",
    },
    {
      name: CcReaderPorts.TO_DSB_CONTROLLER,
      eventTypes: [EventTypesIntern.CC_CARD_REQUEST],
      direction: "out",
    },
  ],
  sm,
  "ccReader"
);

export const ccReaderStartState: StateMachineState<
  CcReaderStates,
  undefined,
  EventTypesExtern | EventTypesIntern,
  CcReaderPorts
> = {
  state: {
    fsm: CcReaderStates.IDLE,
    my: undefined,
  },
  events: [],
  tsType: "State",
};
