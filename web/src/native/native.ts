import { NativeContext, NativeDrawStats } from "engine/native-types.ts";
import { getWebNativeScreen } from "./screen/native-screen.ts";
import { getWebNativeInput } from "./input/native-input.ts";
import { getWebNativeFocus } from "./focus/native-focus.ts";

export function getWebNativeContext(
  onStats: (stats: NativeDrawStats) => void,
): NativeContext {
  return {
    screen: getWebNativeScreen(onStats),
    input: getWebNativeInput(),
    focus: getWebNativeFocus(),
    init: async () => {},
    destroy: () => {},
  };
}
