import { EventTypesExtern } from "./events";
import {
  AbstractState,
  AtomicComponent,
  createPort,
  PortDirection,
} from "@sorrir/framework";

export enum signalMCUPort {
  FROM_PARKING_MANAGEMENT = "FROM_PARKING_MANAGEMENT",
}

export enum barrierMCUPort {
  FROM_DSB_CONTROLLER = "FROM_DSB_CONTROLLER",
}

export enum ccReaderMCUPort {
  TO_DSB_CONTROLLER = "TO_DSB_CONTROLLER",
}

export enum presenceDetectionMCUPort {
  TO_DSB_CONTROLLER = "TO_DSB_CONTROLLER",
}

export enum prsPorts {
  TO_DSB_CONTROLLER = "TO_DSB_CONTROLLER",
  FROM_DSB_CONTROLLER = "FROM_DSB_CONTROLLER",
}

export enum barrierStatusMCUPort {
  TO_DSB_CONTROLLER = "TO_DSB_CONTROLLER",
}

export function createEmptyComponent(
  name: string,
  port:
    | barrierMCUPort
    | signalMCUPort
    | ccReaderMCUPort
    | presenceDetectionMCUPort
    | prsPorts
    | barrierStatusMCUPort,
  direction: PortDirection
): AtomicComponent<
  EventTypesExtern,
  | barrierMCUPort
  | signalMCUPort
  | ccReaderMCUPort
  | presenceDetectionMCUPort
  | prsPorts
  | barrierStatusMCUPort
> {
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

// export const signalMCU = createEmptyComponent(
//   "signalMCU",
//   signalMCUPort.FROM_PARKING_MANAGEMENT
// );
export const barrierMCU = createEmptyComponent(
  "barrierMCU",
  barrierMCUPort.FROM_DSB_CONTROLLER,
  "in"
);

export const ccReaderMCU = createEmptyComponent(
  "ccReaderMCU",
  ccReaderMCUPort.TO_DSB_CONTROLLER,
  "out"
);

export const presenceDetectionMCU = createEmptyComponent(
  "presenceDetectionMCU",
  presenceDetectionMCUPort.TO_DSB_CONTROLLER,
  "out"
);

export const prs = {
  name: "prs",
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  step: (state) => undefined,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  allSteps: (state) => [state],
  ports: [
    createPort(
      prsPorts.TO_DSB_CONTROLLER,
      Object.values(EventTypesExtern),
      "out"
    ),
    createPort(
      prsPorts.FROM_DSB_CONTROLLER,
      Object.values(EventTypesExtern),
      "in"
    ),
  ],
  tsType: "Component",
};

export const barrierStatusMCU = createEmptyComponent(
  "barrierStatusMCU",
  barrierStatusMCUPort.TO_DSB_CONTROLLER,
  "out"
);
