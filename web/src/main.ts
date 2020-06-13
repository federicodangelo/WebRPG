import { FixedColor, Engine } from "engine/types.ts";
import { buildEngine } from "engine/engine.ts";
import { LabelWidget } from "engine/widgets/label.ts";
import { initGame, updateGame } from "game/game.ts";
import { getWebNativeContext } from "./native.ts";
import { initAssets } from "./assets.ts";
import { Game } from "../../game/src/types.ts";
import { NativeContext } from "../../engine/src/native-types.ts";
import { EngineStats } from "./stats.ts";

const TARGET_FPS = 30;

let engine: Engine;
let nativeContext: NativeContext;
let fpsLabel: LabelWidget;
let game: Game;

let updateFpsFrames = 0;
let updateFpsTime = performance.now();

const engineStats = new EngineStats();

let lastRenderNativeAllSamples = 0;
let maxRenderNativePerFrame: number = 0;

function updateFps() {
  const now = performance.now();
  updateFpsFrames++;
  if (now - updateFpsTime > 1000) {
    const deltaTime = now - updateFpsTime;
    const fps = updateFpsFrames / (deltaTime / 1000);

    let stats = `FPS: ${fps.toFixed(1)}`;
    stats += "\n" + engineStats.update.toString();
    stats += "\n" + engineStats.render.toString();
    stats += "\n" + engineStats.renderNative.toString();
    stats += "\n" + "Max RNPF: " + maxRenderNativePerFrame;

    const busyTime = engineStats.render.time + engineStats.update.time;
    const idleTime = deltaTime - busyTime;
    const idlePercent = idleTime * 100 / deltaTime;

    stats += `\nIdle: ${idlePercent.toFixed(1)}%`;

    fpsLabel.text = stats;
    updateFpsTime = now;

    engineStats.reset();
    updateFpsFrames = 0;
    maxRenderNativePerFrame = 0;
  }
}

async function init() {
  console.log("Initializing Engine");

  const assets = await initAssets();

  nativeContext = getWebNativeContext((stats) => {
    if (stats.drawnPixels > 0) {
      engineStats.renderNative.addSample(stats.time);
    }
  });

  engine = await buildEngine(nativeContext);

  console.log("Engine Initialized");

  game = initGame(engine, assets);

  console.log("Game Initialized");

  fpsLabel = new LabelWidget(
    assets.defaultFont,
    "",
    FixedColor.White,
    game.statsContainer.backColor,
  );

  fpsLabel.parent = game.statsContainer;

  return engine;
}

let firstUpdate = true;
let lastUpdateTime = performance.now();
let timeToNextUpdate = 0;

function update() {
  maxRenderNativePerFrame = Math.max(
    maxRenderNativePerFrame,
    engineStats.renderNative.allSamples - lastRenderNativeAllSamples,
  );
  lastRenderNativeAllSamples = engineStats.renderNative.allSamples;

  if (!nativeContext.screen.readyForNextFrame()) return;

  const preUpdateTime = performance.now();
  const delta = preUpdateTime - lastUpdateTime;
  lastUpdateTime = preUpdateTime;
  timeToNextUpdate -= delta;
  if (timeToNextUpdate < -1000) timeToNextUpdate = -1000;

  if (firstUpdate) {
    firstUpdate = false;
    timeToNextUpdate = 1000 / TARGET_FPS;
    return;
  }

  if (timeToNextUpdate > 0.1) return;

  timeToNextUpdate += 1000 / TARGET_FPS;

  updateFps();

  engine.update();

  updateGame(engine, game);

  const postUpdateTime = performance.now();

  engineStats.update.addSample(postUpdateTime - preUpdateTime);

  const drawStats = engine.draw();

  if (drawStats.rects > 0) {
    engineStats.render.addSample(drawStats.time);
  }
}

async function run() {
  const engine = await init();

  function onRequestAnimationFrame() {
    update();
    requestAnimationFrame(onRequestAnimationFrame);
  }

  onRequestAnimationFrame();

  return engine;
}

run();
