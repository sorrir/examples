import { StateMachine, StateMachineState } from "@sorrir/framework";
import {
  createStatemachineComponent,
  AtomicComponent,
} from "@sorrir/framework";

export enum TriggerPorts {
  TRIGGER_OUT = "TRIGGER_OUT",
}

export enum TriggerEventTypes {
  TRIGGER = "TRIGGER",
}

const sm: StateMachine<undefined, undefined, TriggerEventTypes, TriggerPorts> =
  {
    transitions: [],
  };

export const trigger: AtomicComponent<TriggerEventTypes, TriggerPorts> =
  createStatemachineComponent(
    [
      {
        name: TriggerPorts.TRIGGER_OUT,
        eventTypes: [TriggerEventTypes.TRIGGER],
        direction: "out",
      },
    ],
    sm,
    "trigger"
  );

export const triggerStartState: StateMachineState<
  any,
  any,
  undefined,
  undefined
> = {
  state: { fsm: undefined, my: undefined },
  events: [],
  tsType: "State",
};
