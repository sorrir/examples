import {
  RaiseEventCallBack,
  StateMachine,
  StateMachineState,
} from "@sorrir/framework";
import { SensorEventTypes } from "./events";
import {
  createStatemachineComponent,
  AtomicComponent,
} from "@sorrir/framework";

enum States {
  CAR = "CAR",
  NO_CAR = "NO_CAR",
}

export enum SensorPorts {
  TO_DSB = "TO_DSB",
}

type abstractState = number;

const sm: StateMachine<States, abstractState, SensorEventTypes, SensorPorts> = {
  transitions: [
    {
      sourceState: States.NO_CAR,
      targetState: States.CAR,
      action: (
        tick,
        raiseEvent: RaiseEventCallBack<SensorEventTypes, SensorPorts>
      ) => {
        raiseEvent({
          type: SensorEventTypes.DETECTION,
          port: SensorPorts.TO_DSB,
          eventClass: "oneway",
        });
        return tick + 1;
      },
    },
    {
      sourceState: States.CAR,
      targetState: States.CAR,
      condition: (tick) => tick <= 3,
      action: (tick) => tick + 1,
    },
    {
      sourceState: States.CAR,
      targetState: States.NO_CAR,
      condition: (tick) => tick > 3,
      action: (
        tick,
        raiseEvent: RaiseEventCallBack<SensorEventTypes, SensorPorts>
      ) => {
        raiseEvent({
          type: SensorEventTypes.NOTHING,
          port: SensorPorts.TO_DSB,
          eventClass: "oneway",
        });
        return 0;
      },
    },
  ],
};

export const sensor: AtomicComponent<SensorEventTypes, SensorPorts> =
  createStatemachineComponent(
    [
      {
        name: SensorPorts.TO_DSB,
        eventTypes: Object.values(SensorEventTypes),
        direction: "out",
      },
    ],
    sm,
    "sensor"
  );

export const sensorStartState: StateMachineState<
  States,
  abstractState,
  SensorEventTypes,
  SensorPorts
> = { state: { fsm: States.NO_CAR, my: 0 }, events: [], tsType: "State" };
