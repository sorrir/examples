import * as _ from "lodash";
import * as fp from "lodash/fp";
import * as bent from "bent";
import { config } from "../config";

import {
  OneWayEvent,
  RaiseEventCallBack,
  StateMachine,
  StateMachineState,
  Transition,
} from "@sorrir/framework";
import { entries } from "lodash";
import { type } from "os";

export enum States {
  EMPTY = "EMPTY",
  USED = "USED",
  TIMEOUT = "TIMEOUT",
  NOTIFICATION = "NOTIFICATION",
}

export enum BotEventTypes {
  ENTER = "ENTER",
  LEAVE = "LEAVE",
  RESET = "RESET",
}

export interface MattermostCommand extends OneWayEvent<BotEventTypes, unknown> {
  param: {
    user: string;
    timestamp: number;
  };
}

const four_hours = 4 * 1000 * 60 * 60;
const five_hours = 5 * 1000 * 60 * 60;

let dateNowFunction = Date.now;

const overDue = (timeout: number, timestamp: number) =>
  timestamp + timeout < dateNowFunction();

const overdueCondition =
  (timeout: number) => (state: Record<string, number>) => {
    // any entry older than timemout results in taking the transition
    return _.reduce(
      state,
      (result, value, key) => result || overDue(timeout, value),
      false
    );
  };

const EMPTY2USED: Transition<
  States,
  Record<string, number>,
  BotEventTypes,
  unknown
> = {
  sourceState: States.EMPTY,
  targetState: States.USED,
  event: ["oneway", BotEventTypes.ENTER],
  action: (
    state: Record<string, number>,
    raiseEvent: RaiseEventCallBack<BotEventTypes, unknown>,
    event?: OneWayEvent<BotEventTypes, unknown>
  ) => {
    const newState = {
      ...state,
      [event!.param.user]: event!.param.timestamp,
    };

    return newState;
  },
};

const USED2USED_ENTER = {
  ...EMPTY2USED,
  sourceState: States.USED,
};

const TIMEOUT2TIMEOUT_ENTER = {
  ...USED2USED_ENTER,
  sourceState: States.TIMEOUT,
  targetState: States.TIMEOUT,
};

const TIMEOUT2USED = {
  ...USED2USED_ENTER,
  sourceState: States.TIMEOUT,
};

const NOTIFICATION2USED = {
  ...TIMEOUT2USED,
  sourceState: States.NOTIFICATION,
};

const USED2EMPTY: Transition<
  States,
  Record<string, number>,
  BotEventTypes,
  unknown
> = {
  sourceState: States.USED,
  targetState: States.EMPTY,
  event: ["oneway", BotEventTypes.LEAVE],
  condition: (state: Record<string, number>) => {
    return _.size(state) === 1;
  },
  action: (
    state: Record<string, number>,
    raiseEvent: RaiseEventCallBack<BotEventTypes, unknown>,
    event?: OneWayEvent<BotEventTypes, unknown>
  ) => {
    const { [event!.param.user]: x, ...newState } = state;

    return newState;
  },
};

const USED2USED_LEAVE = {
  ...USED2EMPTY,
  targetState: States.USED,
  condition: (state: Record<string, number>): boolean => {
    return _.size(state) > 1;
  },
};

const pingOverdueLabPersons = (state: Record<string, number>) => {
  const filter = fp.filter(([key, value]) => overDue(four_hours, value));
  const reducer = fp.reduce(
    (result, [key, value]) =>
      result.concat(
        `@${key} you forgot to announce leaving the lab\n or extend the time with the \`enterLab\` command`
      ),
    ""
  );
  return fp.compose(reducer, filter, fp.entries)(state);
};

const pingEveryone = (state: Record<string, number>) => {
  const filter = fp.filter(([key, value]) => overDue(five_hours, value));
  const reducer = fp.reduce(
    (result, [key, value]) =>
      result.concat(
        `\n@channel: ${key} did not announce leaving the lab for over 5 hours`
      ),
    ""
  );
  return fp.compose(reducer, filter, fp.entries)(state);
};

const USED2TIMEOUT: Transition<
  States,
  Record<string, number>,
  BotEventTypes,
  unknown
> = {
  sourceState: States.USED,
  targetState: States.TIMEOUT,
  condition: overdueCondition(four_hours),
  action: (state) => {
    console.log("TIMEOUT occured");
    const post = bent(config.incomingBaseURL, "POST", "string", 200);
    const body = {
      text: pingOverdueLabPersons(state).concat(pingEveryone(state)),
    };
    post(config.incomingPath, body).catch((reason) => console.log(reason));
    return state;
  },
};

const TIMEOUT2NOTIFICATION = {
  ...USED2TIMEOUT,
  sourceState: States.TIMEOUT,
  targetState: States.NOTIFICATION,
  condition: overdueCondition(five_hours),
};

const TIMEOUT2EMPTY = {
  ...USED2EMPTY,
  sourceState: States.TIMEOUT,
};

const NOTIFICATION2EMPTY = {
  ...TIMEOUT2EMPTY,
  sourceState: States.NOTIFICATION,
};

export const botStateMachine: StateMachine<
  States,
  Record<string, number>,
  BotEventTypes,
  unknown
> = {
  transitions: [
    EMPTY2USED,
    USED2EMPTY,
    USED2TIMEOUT,
    TIMEOUT2EMPTY,
    USED2USED_ENTER,
    TIMEOUT2USED,
    USED2USED_LEAVE,
    TIMEOUT2TIMEOUT_ENTER,
    TIMEOUT2NOTIFICATION,
    NOTIFICATION2USED,
    NOTIFICATION2EMPTY,
  ].concat(
    Object.keys(States).map((s) => {
      return {
        sourceState: s as any,
        targetState: States.EMPTY,
        event: ["oneway", BotEventTypes.RESET],
        action: (my) => {
          return {};
        },
      };
    })
  ),
};

export const injectDateNowFunction = (f: () => number): void => {
  dateNowFunction = f;
  return;
};
