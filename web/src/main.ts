import { FixedColor, Engine, UPDATE_FPS } from "engine/types.ts";
import { buildEngine } from "engine/engine.ts";
import { LabelWidget } from "engine/widgets/ui/label.ts";
import { initGame, updateGame } from "game/game.ts";
import { getWebNativeContext } from "./native.ts";
import { initAssets } from "./assets.ts";
import { Game } from "../../game/src/types.ts";
import { NativeContext } from "../../engine/src/native-types.ts";
import { EngineStats } from "./stats.ts";

const MAX_PENDING_FRAMES = 1;

let engine: Engine;
let nativeContext: NativeContext;
let statsLabel: LabelWidget;
let game: Game;
let focused = true;

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

    statsLabel.text = stats;
    updateStatsTime = now;

    engineStats.reset();
    updateStatsFrames = 0;
  }
}

async function waitNoPendingFrames() {
  while (!nativeContext.screen.readyForNextFrame(0)) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    nativeContext.screen.processPendingFrames();
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

  nativeContext.focus.onFocusChanged((focus) => {
    if (focus) ignoreUpdate = true;
    focused = focus;
  });

  engine = await buildEngine(nativeContext);

  console.log("Engine Initialized");

  game = initGame(engine, assets, nativeContext);

  console.log("Game Initialized");

  statsLabel = new LabelWidget(
    assets.defaultFont,
    "",
    FixedColor.White,
    game.statsContainer.backColor,
  );

  statsLabel.parent = game.statsContainer;

  //Wait engine ready
  await waitNoPendingFrames();

  //Preload tiles
  for (const tilemap of assets.tilemaps.values()) {
    nativeContext.screen.preloadTiles(tilemap.tiles);
    await waitNoPendingFrames();
  }

  return engine;
}

let ignoreUpdate = true;
let lastUpdateTime = 0;

function updateReal() {
  const preUpdateTime = performance.now();

  updateGame(game);

  engine.update();

  const postUpdateTime = performance.now();

  engineStats.update.addSample(postUpdateTime - preUpdateTime);
}

function drawReal() {
  const drawStats = engine.draw();
  if (drawStats.rects > 0) {
    engineStats.render.addSample(drawStats.time);
  }
}

function update() {
  if (!focused) return;

  nativeContext.screen.processPendingFrames();

  updateStats();

  const now = performance.now();

  if (ignoreUpdate) {
    ignoreUpdate = false;
    lastUpdateTime = now;
    return;
  }

  const delta = now - lastUpdateTime;
  const targetDeltaUpdate = 1000 / UPDATE_FPS;

  if (delta > targetDeltaUpdate - 0.1) {
    lastUpdateTime = Math.max(lastUpdateTime + targetDeltaUpdate, now - 1000);
    updateReal();
  }

  if (nativeContext.screen.readyForNextFrame(MAX_PENDING_FRAMES)) {
    drawReal();
  }
}

function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) document.body.removeChild(loader);
}

async function run() {
  const engine = await init();

  updateReal();
  drawReal();

  while (!nativeContext.screen.readyForNextFrame(0)) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    nativeContext.screen.processPendingFrames();
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
