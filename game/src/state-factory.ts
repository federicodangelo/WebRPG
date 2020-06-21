import { StateFactory, StateId } from "./types.ts";
import { buildGameState } from "./states/game/game.ts";
import { buildMainMenuState } from "./states/mainmenu/mainmenu.ts";
import { buildBenchmarkState } from "./states/benchmark/benchmark.ts";
import { buildSettingsState } from "./states/settings/settings.ts";

export function buildStateFactory(): StateFactory {
  return {
    buildState: (id) => {
      switch (id) {
        case StateId.Game:
          return buildGameState();
        case StateId.MainMenu:
          return buildMainMenuState();
        case StateId.Benchmark:
          return buildBenchmarkState();
        case StateId.Settings:
          return buildSettingsState();
      }
    },
  };
}
