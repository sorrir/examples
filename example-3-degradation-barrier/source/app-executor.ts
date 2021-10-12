import { executeRunConfiguration } from "@sorrir/framework";
import { INIT_SEQUENCER_CLOCK_STATE } from "@sorrir/framework";
import { computeLocallyDeployedConfiguration } from "@sorrir/framework";
import * as sorrirLogger from "@sorrir/sorrir-logging";
import { setup } from "@sorrir/framework";
import { Stakeholder } from "@sorrir/sorrir-logging";

sorrirLogger.configLogger({ area: "execution" });
// Be polite and say hello
sorrirLogger.info(
  Stakeholder.SYSTEM,
  "Hello Sorrir! " + process.env["SORRIR_ES_URL"],
  {}
);

const runConfig = setup();

async function main() {
  if (
    runConfig.toExecute &&
    runConfig.toExecute !== "" &&
    runConfig.hostConfiguration.hasOwnProperty(runConfig.toExecute)
  ) {
    // TODO Later  : create a *resilience configuration* to maintain knowledge,
    //  which component should be equipped with which resilience mechanism..

    // Init logical clocks for each component here..
    computeLocallyDeployedConfiguration(runConfig).components.forEach(
      (component) =>
        runConfig.clockStates.set(component, INIT_SEQUENCER_CLOCK_STATE)
    );

    await executeRunConfiguration(runConfig);
  } else if (
    runConfig.toExecute !== "" &&
    !runConfig.hostConfiguration.hasOwnProperty(runConfig.toExecute)
  ) {
    console.log(`unknown host "${runConfig.toExecute}`);
  } else {
    console.log("no container defined to execute");
  }
}

main().catch((e) => console.log(e));
