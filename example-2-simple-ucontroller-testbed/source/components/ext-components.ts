import { EventTypesExtern } from "./event-types";
import {
  AbstractState,
  AtomicComponent,
  createPort,
  PortDirection,
} from "@sorrir/framework";

export enum signalMCUPort {
  FROM_PARKING_MANAGEMENT = "FROM_PARKING_MANAGEMENT",
}

export enum buttonMCUPort {
  TO_BARRIER = "TO_BARRIER",
}

/*const mqttButtonTopic = "sorrir/button-pressed";
const mqttBarrierControllerName = "mqtt-button-receiver";
const mqttSignalTopic = "sorrir/signal-update";
const mqttSignalControllerName = "mqtt-signal-publisher";*/

function createEmptyComponent(
  name: string,
  port: buttonMCUPort | signalMCUPort,
  direction: PortDirection
): AtomicComponent<EventTypesExtern, buttonMCUPort | signalMCUPort> {
  return {
    name: name,
    step: (state) => undefined,
    allSteps: (state) => [state],
    ports: [createPort(port, Object.values(EventTypesExtern), direction)],
    tsType: "Component",
  };
}

export const compState: AbstractState<string, unknown, unknown> = {
  state: "dummy_state",
  events: [],
  tsType: "State",
};

export const signalMCU = createEmptyComponent(
  "signalMCU",
  signalMCUPort.FROM_PARKING_MANAGEMENT,
  "in"
);
export const buttonMCU = createEmptyComponent(
  "buttonMCU",
  buttonMCUPort.TO_BARRIER,
  "out"
);
