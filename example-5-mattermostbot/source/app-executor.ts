import * as express from "express";

import * as sorrirLogger from "@sorrir/sorrir-logging";

import * as bot from "./components/bot";
import { StateMachineState, step } from "@sorrir/framework";
import { Schema, Validator } from "jsonschema";
import { assert } from "console";

import { config } from "./config";

const incomingMsgSchema: Schema = {
  id: "/v0/events",
  type: "object",
  properties: {
    text: { type: "string" },
    user_name: { type: "string" },
    command: { type: "string", enum: ["/enterlab", "/leavelab", "/resetlab"] },
    token: { type: "string" },
  },
  required: ["text", "user_name", "command", "token"],
};

const configSchema: Schema = {
  id: "config",
  type: "object",
  properties: {
    incomingBaseURL: { type: "string" },
    incomingPath: { type: "string" },
    outgoingToken: { type: "string" },
    slashCommandEnterLabToken: { type: "string" },
    slashCommandLeaveLabToken: { type: "string" },
    slashCommandResetLabToken: { type: "string" },
  },
  required: [
    "incomingBaseURL",
    "incomingPath",
    "outgoingToken",
    "slashCommandEnterLabToken",
    "slashCommandLeaveLabToken",
    "slashCommandResetLabToken",
  ],
};

const jsonValidator = new Validator();

sorrirLogger.configLogger({ area: "execution" });
// Be polite and say hello
console.log("Hello Sorrir!");

assert(jsonValidator.validate(config, configSchema));

/*
HOW TO RUN
from cli:
npm run startExecutor
 */

let state: StateMachineState<
  bot.States,
  Record<string, number>,
  bot.BotEventTypes,
  unknown
> = {
  state: { fsm: bot.States.EMPTY, my: {} },
  events: [],
  tsType: "State",
};

const convertEventType = (str: string) => {
  if (str === "/enterlab") return bot.BotEventTypes.ENTER;
  if (str === "/leavelab") return bot.BotEventTypes.LEAVE;
  if (str === "/resetlab") return bot.BotEventTypes.RESET;
};

bot.injectDateNowFunction(Date.now);

async function main() {
  console.log("starting express!");

  const app = express();
  app.use(express.urlencoded({ extended: false }));

  app.post("/v0/events", (req, res) => {
    console.log(req.body);
    if (
      req.body.token !== config.slashCommandEnterLabToken &&
      req.body.token !== config.slashCommandLeaveLabToken &&
      req.body.token !== config.slashCommandResetLabToken
    ) {
      res.status(401).send({ text: "token not correct" });
      return;
    }

    const result = jsonValidator.validate(req.body, incomingMsgSchema);
    if (result.valid) {
      const newEvent: bot.MattermostCommand = {
        eventClass: "oneway",
        type: convertEventType(req.body.command)!,
        id: req.body.post_id,
        param: {
          user: req.body.user_name,
          timestamp: Date.now(),
        },
      };

      const newState = {
        ...state,
        events: [...state.events, newEvent],
      };

      const nextState = step(bot.botStateMachine, newState);
      if (nextState !== undefined) state = nextState;

      res.status(200).send(createResponse(state.state));
    } else {
      res.status(400).send({ error: result.errors });
      console.log(result.errors);
    }
  });

  app.listen(3000);

  setInterval(function () {
    // Set interval for checking
    console.log("run timer check");
    const nextState = step(bot.botStateMachine, state);
    if (nextState !== undefined) state = nextState;
  }, 5 * 1000); // Repeat every 5 seconds
}

main().catch((e) => console.log(e));

function createResponse(state: {
  fsm: bot.States;
  my: Record<string, number>;
}): Record<string, string> {
  let usertable = `|User|Since|
    |:---|:----|
   `;

  for (const key in state.my) {
    usertable = usertable.concat(`|${key}|${new Date(state.my[key])}|\n`);
  }

  return {
    response_type: "in_channel",
    text: `Lab state: ${state.fsm}\n---\n${usertable}`,
  };
}
/*
Trigger event:
curl -X POST  -H "Content-Type: application/json"  -d '@test.json'  localhost:3000/v0/events
*/
