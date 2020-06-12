import { FixedColor, Engine } from "engine/types.ts";
import { buildEngine } from "engine/engine.ts";
import { LabelWidget } from "engine/widgets/label.ts";
import { initGame, updateGame } from "game/game.ts";
import { getWebNativeContext } from "./native/web.ts";
import { initAssets } from "./native/assets.ts";
import { Game } from "../../game/src/types.ts";
import { NativeContext } from "../../engine/src/native-types.ts";

const TARGET_FPS = 30;

let engine: Engine;
let nativeContext: NativeContext;
let fpsLabel: LabelWidget;
let game: Game;

let totalRenderTime = 0;
let totalUpdateTime = 0;
let totalRenderFrames = 0;
let frames = 0;
let updateFpsTime = performance.now();

function updateFps() {
  const now = performance.now();
  frames++;
  if (now - updateFpsTime > 1000) {
    const deltaTime = now - updateFpsTime;
    const fps = frames / (deltaTime / 1000);
    const updateTime = totalUpdateTime / frames;
    const renderTime = totalRenderFrames > 0
      ? (totalRenderTime / totalRenderFrames)
      : 0;
    const busyTime = (totalUpdateTime + totalRenderTime);
    const idleTime = deltaTime - busyTime;
    const idlePercent = idleTime * 100 / deltaTime;

    const stats = `FPS:\n ${fps.toFixed(1)}\nRen ${totalRenderFrames}:\n ${
      renderTime.toFixed(1)
    }ms\nUpd:\n ${updateTime.toFixed(1)}ms\nIdle:\n ${idlePercent.toFixed(1)}%`;

    fpsLabel.text = stats;
    updateFpsTime = now;
    frames = 0;
    totalRenderFrames = 0;
    totalRenderTime = 0;
    totalUpdateTime = 0;
  }
}

async function init() {
  console.log("Initializing Engine");

  const assets = await initAssets();

  nativeContext = getWebNativeContext();

  engine = await buildEngine(nativeContext);

  console.log("Engine Initialized");

  game = initGame(engine, assets);

  console.log("Game Initialized");

  fpsLabel = new LabelWidget(
    assets.defaultFont,
    "FPS:\n 0.00\nRender:\n 0.00ms",
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

  totalUpdateTime += postUpdateTime - preUpdateTime;

  const drawStats = engine.draw();

  if (drawStats.pixels > 0) {
    totalRenderFrames++;
    totalRenderTime += drawStats.time;
    //console.debug(drawStats);
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
