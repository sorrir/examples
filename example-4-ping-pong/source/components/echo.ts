import {
  RaiseEventCallBack,
  StateMachine,
  StateMachineState,
} from "@sorrir/framework";
import {
  createStatemachineComponent,
  AtomicComponent,
} from "@sorrir/framework";

enum States {
  ECHO,
}
export enum EchoPorts {
  ECHO_IN = "ECHO_IN",
  ECHO_OUT = "ECHO_OUT",
}

export enum EchoEventTypes {
  ECHO = "ECHO",
}

const sm: StateMachine<States, undefined, EchoEventTypes, EchoPorts> = {
  transitions: [
    {
      sourceState: States.ECHO,
      targetState: States.ECHO,
      event: ["oneway", EchoEventTypes.ECHO, EchoPorts.ECHO_IN],
      action: (
        state: States | undefined,
        raiseEvent: RaiseEventCallBack<EchoEventTypes, EchoPorts>
      ) => {
        raiseEvent({
          eventClass: "oneway",
          type: EchoEventTypes.ECHO,
          port: EchoPorts.ECHO_OUT,
        });
        return undefined;
      },
    },
  ],
};

export const echo: AtomicComponent<EchoEventTypes, EchoPorts> =
  createStatemachineComponent(
    [
      {
        name: EchoPorts.ECHO_IN,
        eventTypes: [EchoEventTypes.ECHO],
        direction: "in",
      },
      {
        name: EchoPorts.ECHO_OUT,
        eventTypes: [EchoEventTypes.ECHO],
        direction: "out",
      },
    ],
    sm,
    "echo"
  );

export const echoStartState: StateMachineState<any, any, undefined, undefined> =
  {
    state: { fsm: States.ECHO, my: undefined },
    events: [],
    tsType: "State",
  };
