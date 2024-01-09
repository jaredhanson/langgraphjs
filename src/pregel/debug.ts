import { Runnable } from "@langchain/core/runnables";
import { BaseChannel, EmptyChannelError } from "../channels/base.js";

/**
 * @TODO pull in colored text util from lc ConsoleCallbackHandler
 */

export function printStepStart(
  step: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextTasks: Array<[Runnable, any, string]>
): void {
  const nTasks = nextTasks.length;
  console.log(
    `[pregel/step]`,
    `Starting step ${step} with ${nTasks} task${
      nTasks === 1 ? "" : "s"
    }. Next tasks:\n`,
    `\n${nextTasks
      .map(([_, val, name]) => `- ${name}(${JSON.stringify(val, null, 2)})`)
      .join("\n")}`
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChannelWithNameMapping<Value = any> = {
  [key: string]: BaseChannel<Value, Value, Value>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function printCheckpoint<Value = any>(
  step: number,
  channels: ChannelWithNameMapping<Value>
) {
  console.log(
    `[pregel/checkpoint]`,
    `Finishing step ${step}. Channel values:\n`,
    `\n${JSON.stringify(
      Object.fromEntries(_readChannels<Value>(channels)),
      null,
      2
    )}`
  );
}

function* _readChannels<Value>(
  channels: ChannelWithNameMapping<Value>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): IterableIterator<[string, any]> {
  for (const [name, channel] of Object.entries(channels)) {
    try {
      yield [name, channel.get()];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.name === EmptyChannelError.name) {
        // Skip the channel if it's empty
        continue;
      } else {
        throw error; // Re-throw the error if it's not an EmptyChannelError
      }
    }
  }
}
