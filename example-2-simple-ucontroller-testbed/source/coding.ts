import { DecodeEventFunction } from "@sorrir/framework/dist/communication/decoding";
import { Event } from "@sorrir/framework/dist/util/engine";

export const testbedEventDecoder: DecodeEventFunction = (
  json: Record<string, unknown>
) => {
  return {
    eventClass: "oneway",
    id: "",
    type: json.event,
    payload: json.payload,
  } as Event<unknown, unknown>;
};

export function testbedStatusEncoder(
  status: boolean | undefined
): string | undefined {
  return status ? "1" : "0";
}

export function testbedSpacesEncoder(
  freeSpaces: number | undefined
): string | undefined {
  return freeSpaces ? freeSpaces.toString() : "0";
}
