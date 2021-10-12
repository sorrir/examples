// import {
//   Configuration,
//   createConnection,
//   createHierarchicalComponent,
// } from "@sorrir/framework";
// import { barrier, BarrierPorts } from "./dsb/barrier";
// import { ccReader, CcReaderPorts } from "./dsb/cc-reader";
// import { dsbController, DsbControllerPorts } from "./dsb/dsb-controller";
// import {
//   barrierMCU,
//   barrierMCUPort,
//   ccReaderMCU,
//   ccReaderMCUPort,
//   presenceDetectionMCU,
//   presenceDetectionMCUPort,
// } from "../ext-components";
// import { EventTypesExtern, EventTypesIntern } from "../events";
//
// export enum DsbPorts {
//   FROM_PARKING_MANAGEMENT = "FROM_PARKING_MANAGEMENT",
//   TO_PARKING_MANAGEMENT = "TO_PARKING_MANAGEMENT",
// }
//
// const dsb_configuration: Configuration = {
//   components: [
//     barrier,
//     ccReader,
//     dsbController,
//     presenceDetectionMCU,
//     barrierMCU,
//   ],
//   connections: [
//     createConnection(
//       dsbController,
//       DsbControllerPorts.TO_BARRIER,
//       barrier,
//       BarrierPorts.FROM_DSB_CONTROL
//     ),
//     createConnection(
//       ccReader,
//       CcReaderPorts.TO_DSB_CONTROLLER,
//       dsbController,
//       DsbControllerPorts.FROM_CC_READER
//     ),
//     createConnection(
//       presenceDetectionMCU,
//       presenceDetectionMCUPort.TO_DSB_CONTROLLER,
//       dsbController,
//       DsbControllerPorts.FROM_PRESENCE_DETECTION
//     ),
//     createConnection(
//       barrier,
//       BarrierPorts.TO_BARRIER_MCU,
//       barrierMCU,
//       barrierMCUPort.FROM_BARRIER
//     ),
//     createConnection(
//       ccReaderMCU,
//       ccReaderMCUPort.TO_CC_READER,
//       ccReader,
//       CcReaderPorts.FROM_CC_READER_MCU
//     ),
//   ],
// };
//
// export const dsbAsHierarchicalComponent = createHierarchicalComponent<
//   any,
//   EventTypesIntern | EventTypesExtern,
//   DsbPorts | DsbControllerPorts,
//   undefined
// >(
//   {
//     name: "dsb",
//     ports: [
//       {
//         name: DsbPorts.TO_PARKING_MANAGEMENT,
//         eventTypes: Object.values(EventTypesIntern),
//       },
//       {
//         name: DsbPorts.FROM_PARKING_MANAGEMENT,
//         eventTypes: Object.values(EventTypesIntern),
//       },
//     ],
//     subConfiguration: dsb_configuration,
//     delegations: [
//       {
//         type: "OutDelegation",
//         source: [
//           {
//             sourceComponent: dsbController,
//             sourcePort: {
//               name: DsbControllerPorts.TO_PARKING_MANAGEMENT,
//               eventTypes: [EventTypesIntern.CC_CARD_REQUEST],
//             },
//           },
//         ],
//         target: [
//           {
//             targetPort: {
//               name: DsbPorts.TO_PARKING_MANAGEMENT,
//               eventTypes: [EventTypesIntern.CC_CARD_REQUEST],
//             },
//           },
//         ],
//       },
//       {
//         type: "IntoDelegation",
//         source: [
//           {
//             sourcePort: {
//               name: DsbPorts.FROM_PARKING_MANAGEMENT,
//               eventTypes: [EventTypesIntern.OPEN],
//             },
//           },
//         ],
//         target: [
//           {
//             targetComponent: dsbController,
//             targetPort: {
//               name: DsbControllerPorts.FROM_DSB,
//               eventTypes: [EventTypesIntern.OPEN],
//             },
//           },
//         ],
//       },
//     ],
//     tsType: "Component",
//   },
//   true
// );
