import { NativeContextFocus } from "engine/native-types.ts";

export function getWebNativeFocus(): NativeContextFocus {
  const focusListeners: ((focus: boolean) => void)[] = [];

  const dispatchFocusEvent = (focus: boolean) => {
    focusListeners.forEach((l) => l(focus));
  };

  const handleVisibilityChange = () => {
    const focus = document.visibilityState === "visible";
    dispatchFocusEvent(focus);
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  return {
    onFocusChanged: (listener) => focusListeners.push(listener),
  };
}
