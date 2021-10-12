import { Event } from "@sorrir/framework";

export enum EventTypesIntern {
  OPEN = "OPEN",
  CLOSE = "CLOSE",
  CC_CARD_REQUEST = "CC_CARD_REQUEST",
  LICENSE_PLATE_REQUEST = "LICENSE_PLATE_REQUEST",
}

export enum EventTypesExtern {
  BARRIER_CONTROL = "BARRIER_CONTROL",
  CC_CARD_DETECTED = "CC_CARD_DETECTED",
  CAR_DETECTED = "CAR_DETECTED",
  NOTHING = "NOTHING",
  CAR_ENTERED = "CAR_ENTERED",
  PR_REQUEST = "PR_REQUEST",
  PLATE_DETECTED = "PLATE_DETECTED",
  BARRIER_IS_CLOSED = "BARRIER_IS_CLOSED",
  BARRIER_IS_OPEN = "BARRIER_IS_OPEN",
}

export type CreditCardEvent<E, P> = Event<E, P> & {
  param: {
    ccNumber: string;
  };
};
