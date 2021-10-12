import {
  OneWayEvent,
  OneWayTransition,
  RaiseEventCallBack,
  RequestEvent,
  ResolveEvent,
  StateMachine,
  StateMachineState,
} from "@sorrir/framework";
import {
  createStatemachineComponent,
  AtomicComponent,
} from "@sorrir/framework";

enum States {
  IDLE,
  ECHO,
}

type CallState = {
  tick: number;
  maxticks: number;
};

export enum CallPorts {
  TRIGGER_IN = "TRIGGER_IN",
  ECHO_IN = "ECHO_IN",
  ECHO_OUT = "ECHO_OUT",
}

export enum CallEventTypes {
  TRIGGER = "TRIGGER",
  ECHO = "ECHO",
}

const sm: StateMachine<States, CallState, CallEventTypes, CallPorts> = {
  transitions: [
    {
      sourceState: States.IDLE,
      targetState: States.ECHO,
      event: ["oneway", CallEventTypes.TRIGGER, CallPorts.TRIGGER_IN],
      action: (
        _,
        raiseEvent: RaiseEventCallBack<CallEventTypes, CallPorts>,
        event: OneWayEvent<CallEventTypes, CallPorts> | undefined
      ) => {
        raiseEvent({
          eventClass: "oneway",
          type: CallEventTypes.ECHO,
          port: CallPorts.ECHO_OUT,
        });
        return { tick: 1, maxticks: (event ?? {}).param?.maxticks ?? 1 };
      },
    },
    {
      sourceState: States.ECHO,
      targetState: States.ECHO,
      event: ["oneway", CallEventTypes.ECHO, CallPorts.ECHO_IN],
      condition: (state) => state.tick < state.maxticks,
      action: (state, raiseEvent) => {
        raiseEvent({
          type: CallEventTypes.ECHO,
          port: CallPorts.ECHO_OUT,
        });
        return { tick: state.tick + 1, maxticks: state.maxticks };
      },
    },
    {
      sourceState: States.ECHO,
      targetState: States.IDLE,
      event: ["oneway", CallEventTypes.ECHO, CallPorts.ECHO_IN],
      condition: (state) => state.tick >= state.maxticks,
      action: () => {
        return { tick: 0, maxticks: 0 };
      },
    },
  ],
};

export const call: AtomicComponent<CallEventTypes, CallPorts> =
  createStatemachineComponent(
    [
      {
        name: CallPorts.TRIGGER_IN,
        eventTypes: [CallEventTypes.TRIGGER],
        direction: "in",
      },
      {
        name: CallPorts.ECHO_IN,
        eventTypes: [CallEventTypes.ECHO],
        direction: "in",
      },
      {
        name: CallPorts.ECHO_OUT,
        eventTypes: [CallEventTypes.ECHO],
        direction: "out",
      },
    ],
    sm,
    "call"
  );

export const callStartState: StateMachineState<any, any, undefined, undefined> =
  {
    state: { fsm: States.IDLE, my: { tick: 0, maxticks: 0 } },
    events: [],
    tsType: "State",
  };
