import { FixedColor, Engine, UPDATE_FPS, Assets } from "engine/types.ts";
import { buildEngine } from "engine/engine.ts";
import { LabelWidget } from "engine/widgets/ui/label.ts";
import { buildStateFactory } from "game/state-factory.ts";
import { getWebNativeContext } from "./native/native.ts";
import { initAssets } from "./assets.ts";
import { State, StateFactory, StateId, StateParams } from "game/types.ts";
import { NativeContext } from "engine/native-types.ts";
import { EngineStats } from "./stats.ts";

const MAX_PENDING_FRAMES = 1;

let engine: Engine;
let native: NativeContext;
let assets: Assets;
let stateParams: StateParams;
let statsLabel: LabelWidget | null = null;
let currentState: State | null = null;
let focused = true;
let stateFactory: StateFactory;

let updateStatsFrames = 0;
let updateStatsTime = performance.now();

const engineStats = new EngineStats();

function updateStats() {
  const now = performance.now();
  updateStatsFrames++;
  if (now - updateStatsTime > 1000) {
    const deltaTime = now - updateStatsTime;
    const fps = updateStatsFrames / (deltaTime / 1000);

    let stats = `FPS: ${fps.toFixed(1)}`;
    stats += "\n" + engineStats.update.toString();
    stats += "\n" + engineStats.render.toString();
    stats += "\n" + engineStats.renderNative.toString();

    const busyTime = engineStats.render.time + engineStats.update.time;
    const idleTime = deltaTime - busyTime;
    const idlePercent = idleTime * 100 / deltaTime;

    stats += `\nIdle: ${idlePercent.toFixed(1)}%`;

    if (statsLabel !== null) {
      statsLabel.text = stats;
    }
    updateStatsTime = now;

    engineStats.reset();
    updateStatsFrames = 0;
  }
}

async function waitNoPendingFrames() {
  while (!native.screen.readyForNextFrame(0)) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    native.screen.processPendingFrames();
  }
}

function initState(newState: State) {
  if (currentState !== null) {
    console.log(`Destroying ${currentState.id} State`);
    currentState.destroy(stateParams);
    console.log(`State ${currentState.id} Destroyed`);
    currentState = null;
    statsLabel = null;
  }

  console.log(`Initializing ${newState.id} State`);

  const initResult = newState.init(stateParams);

  console.log(`State ${newState.id} Initialized`);

  if (initResult.statsContainer) {
    statsLabel = new LabelWidget(
      assets.defaultFont,
      "",
      FixedColor.White,
    );

    statsLabel.parent = initResult.statsContainer;
  }

  currentState = newState;
}

async function init(mainStateId: StateId) {
  stateFactory = buildStateFactory();

  console.log("Initializing Engine");

  native = getWebNativeContext((stats) => {
    if (stats.drawnPixels > 0) {
      engineStats.renderNative.addSample(stats.time);
    }
  });

  native.focus.onFocusChanged((focus) => {
    if (focus) ignoreNextUpdate = true;
    focused = focus;
  });

  engine = await buildEngine(native);

  engine.onKeyEvent((e) => {
    if (currentState?.onKeyEvent) {
      currentState.onKeyEvent(e, stateParams);
    }
  });
  engine.onMouseEvent((e) => {
    if (currentState?.onMouseEvent) {
      currentState.onMouseEvent(e, stateParams);
    }
  });
  native.screen.onFullScreenChanged((fs) => {
    if (currentState?.onFullScreenChanged) {
      currentState.onFullScreenChanged(fs, stateParams);
    }
  });

  console.log("Engine Initialized");

  console.log("Loading Assets");
  assets = await initAssets();
  console.log("Assets Loaded");

  stateParams = {
    engine,
    assets,
    native,
  };

  initState(stateFactory.buildState(mainStateId));

  //Wait engine ready
  await waitNoPendingFrames();

  //Preload assets
  for (const tilemap of assets.tilemaps.values()) {
    native.screen.preloadTilemap(tilemap);
    await waitNoPendingFrames();
  }
  for (const spritesheet of assets.spritesheets.values()) {
    native.screen.preloadSpritesheet(spritesheet);
    await waitNoPendingFrames();
  }
  for (const font of assets.fonts.values()) {
    native.screen.preloadTilemap(font);
    await waitNoPendingFrames();
  }

  return engine;
}

let ignoreNextUpdate = true;
let lastUpdateTime = 0;

function updateReal() {
  const preUpdateTime = performance.now();
  let nextStateId: StateId | null = null;

  if (currentState !== null) {
    nextStateId = currentState.update(stateParams);
  }

  engine.update();

  const postUpdateTime = performance.now();

  engineStats.update.addSample(postUpdateTime - preUpdateTime);

  if (nextStateId !== null) {
    initState(stateFactory.buildState(nextStateId));
    ignoreNextUpdate = true;
  }
}

function drawReal() {
  const drawStats = engine.draw();
  if (drawStats.rects > 0) {
    engineStats.render.addSample(drawStats.time);
  }
}

function update() {
  if (!focused) return;

  native.screen.processPendingFrames();

  updateStats();

  const now = performance.now();

  if (ignoreNextUpdate) {
    ignoreNextUpdate = false;
    lastUpdateTime = now;
    return;
  }

  const delta = now - lastUpdateTime;
  const targetDeltaUpdate = 1000 / UPDATE_FPS;

  if (delta > targetDeltaUpdate - 0.1) {
    lastUpdateTime = Math.max(lastUpdateTime + targetDeltaUpdate, now - 1000);
    updateReal();
  }

  if (native.screen.readyForNextFrame(MAX_PENDING_FRAMES)) {
    drawReal();
  }
}

function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) document.body.removeChild(loader);
}

async function run() {
  const engine = await init(StateId.MainMenu);

  updateReal();
  drawReal();

  while (!native.screen.readyForNextFrame(0)) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    native.screen.processPendingFrames();
  }

  lastUpdateTime = performance.now();

  hideLoader();

  function onRequestAnimationFrame() {
    update();
    requestAnimationFrame(onRequestAnimationFrame);
  }

  onRequestAnimationFrame();

  return engine;
}

run();
