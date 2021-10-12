export enum EventTypesIntern {
  CAR_IN = "CAR_IN",
  CAR_OUT = "CAR_OUT",
}

export enum EventTypesExtern {
  BUTTON_UP_PRESSED = "BUTTON_UP_PRESSED",
  BUTTON_DOWN_PRESSED = "BUTTON_DOWN_PRESSED",
  LED_RED = "LED_RED",
  LED_GREEN = "LED_GREEN",
  DISPLAY = "DISPLAY",
}

export type AllEventTypes = EventTypesIntern | EventTypesExtern;
