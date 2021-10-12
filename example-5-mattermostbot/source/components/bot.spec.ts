/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { StateMachineState, step } from "@sorrir/framework";
import { parseCommandLine } from "typescript";
import * as bot from "./bot";

describe("sm tests", () => {
  let time = 0;
  let state;
  const hours = (ms: number) => ms * 1000 * 60 * 60;
  bot.injectDateNowFunction(() => hours(time)); // time in hours 

  const enter: bot.MattermostCommand = {
    eventClass: "oneway",
    type: bot.BotEventTypes.ENTER,
    id: "42",
    param: {
      timestamp: hours(time),
      user: "alice",
    },
  };

  const leave: bot.MattermostCommand = {
    ...enter,
    type: bot.BotEventTypes.LEAVE,
  };

  beforeEach(() => {
    time = 0;

    state = {
      state: { fsm: bot.States.EMPTY, my: {} },
      events: [],
      tsType: "State",
    };
  });

  it("enter->leave", () => {
    state = step(bot.botStateMachine, { ...state, events: [enter] })!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.USED);
    expect(state.state.my).toHaveProperty("alice");

    time++;
    state = step(bot.botStateMachine, {
      ...state,
      events: [{ ...enter, type: bot.BotEventTypes.LEAVE }],
    })!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.EMPTY);
    expect(state.state.my).not.toHaveProperty("alice");
    expect(state.state.my).toEqual({});
  });

  it("enter->reset", () => {
    state = step(bot.botStateMachine, { ...state, events: [enter] })!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.USED);
    expect(state.state.my).toHaveProperty("alice");

    time++;
    state = step(bot.botStateMachine, {
      ...state,
      events: [{ ...enter, type: bot.BotEventTypes.RESET }],
    })!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.EMPTY);
    expect(state.state.my).not.toHaveProperty("alice");
    expect(state.state.my).toEqual({});
  });

  it("enter->enter->reset", () => {
    state = step(bot.botStateMachine, { ...state, events: [enter] })!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.USED);
    expect(state.state.my).toHaveProperty("alice");

    time++;

    const bob = { ...enter, param: { ...enter.param, user: "bob" } };
    state = step(bot.botStateMachine, { ...state, events: [bob] })!;

    time++;
    state = step(bot.botStateMachine, {
      ...state,
      events: [{ ...enter, type: bot.BotEventTypes.RESET }],
    })!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.EMPTY);
    expect(state.state.my).not.toHaveProperty("alice");
    expect(state.state.my).not.toHaveProperty("bob");
    expect(state.state.my).toEqual({});
  });

  it("interleaved enter-enter-leave-leave", () => {
    state = step(bot.botStateMachine, { ...state, events: [enter] })!;

    time++;

    const bob = { ...enter, param: { ...enter.param, user: "bob" } };
    state = step(bot.botStateMachine, { ...state, events: [bob] })!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.USED);
    expect(state.state.my).toHaveProperty("alice");
    expect(state.state.my).toHaveProperty("bob");

    time++;

    state = step(bot.botStateMachine, {
      ...state,
      events: [leave],
    })!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.USED);
    expect(state.state.my).not.toHaveProperty("alice");
    expect(state.state.my).toHaveProperty("bob");

    time++;

    state = step(bot.botStateMachine, {
      ...state,
      events: [{ ...bob, type: bot.BotEventTypes.LEAVE }],
    })!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.EMPTY);
    expect(state.state.my).toEqual({});
  });

  it("timeout -> extend", () => {
    state = step(bot.botStateMachine, { ...state, events: [enter] })!;

    time += 5;

    state = step(bot.botStateMachine, state)!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.TIMEOUT);
    expect(state.state.my).toHaveProperty("alice");

    time++;

    state = step(bot.botStateMachine, { ...state, events: [enter] })!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.USED);
    expect(state.state.my).toHaveProperty("alice");
  });

  it("timeout -> notification -> used", () => {
    state = step(bot.botStateMachine, { ...state, events: [enter] })!;

    time += 5;

    state = step(bot.botStateMachine, state)!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.TIMEOUT);
    expect(state.state.my).toHaveProperty("alice");

    time++;

    state = step(bot.botStateMachine, state)!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.NOTIFICATION);
    expect(state.state.my).toHaveProperty("alice");

    time++;

    state = step(bot.botStateMachine, { ...state, events: [enter] })!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.USED);
    expect(state.state.my).toHaveProperty("alice");
  });

  it("timeout -> notification -> empty", () => {
    state = step(bot.botStateMachine, { ...state, events: [enter] })!;

    time += 5;

    state = step(bot.botStateMachine, state)!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.TIMEOUT);
    expect(state.state.my).toHaveProperty("alice");

    time++;

    state = step(bot.botStateMachine, state)!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.NOTIFICATION);
    expect(state.state.my).toHaveProperty("alice");

    time++;

    state = step(bot.botStateMachine, { ...state, events: [leave] })!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.EMPTY);
    expect(state.state.my).not.toHaveProperty("alice");
  });

  it("timeout -> reset", () => {
    state = step(bot.botStateMachine, { ...state, events: [enter] })!;

    time += 5;

    state = step(bot.botStateMachine, state)!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.TIMEOUT);
    expect(state.state.my).toHaveProperty("alice");

    state = step(bot.botStateMachine, {
      ...state,
      events: [{ ...enter, type: bot.BotEventTypes.RESET }],
    })!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.EMPTY);
    expect(state.state.my).not.toHaveProperty("alice");
    expect(state.state.my).toEqual({});
  });

  it("timeout -> extend -> timeout -> leave", () => {
    state = step(bot.botStateMachine, { ...state, events: [enter] })!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.USED);

    time += 5;

    state = step(bot.botStateMachine, state)!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.TIMEOUT);
    expect(state.state.my).toHaveProperty("alice");

    time++;

    state = step(bot.botStateMachine, {
      ...state,
      events: [
        { ...enter, param: { ...enter.param, timestamp: hours(time) } },
      ],
    })!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.USED);
    expect(state.state.my).toHaveProperty("alice");

    time += 5;

    state = step(bot.botStateMachine, state)!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.TIMEOUT);
    expect(state.state.my).toHaveProperty("alice");

    time++;

    state = step(bot.botStateMachine, {
      ...state,
      events: [{ ...enter, type: bot.BotEventTypes.LEAVE }],
    })!;
    expect(state).toBeDefined();
    expect(state.state.fsm).toBe(bot.States.EMPTY);
    expect(state.state.my).not.toHaveProperty("alice");
  });
});
