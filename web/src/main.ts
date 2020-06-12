import { FixedColor, Engine } from "engine/types.ts";
import { buildEngine } from "engine/engine.ts";
import { LabelWidget } from "engine/widgets/label.ts";
import { initGame, updateGame } from "game/game.ts";
import { getWebNativeContext } from "./native/web.ts";
import { initAssets } from "./native/assets.ts";
import { Game } from "../../game/src/types.ts";

const TARGET_FPS = 30;

let engine: Engine;
let fpsLabel: LabelWidget;
let game: Game;

let totalRenderTime = 0;
let frames = 0;
let framesTime = performance.now();

function updateFps() {
  const now = performance.now();
  frames++;
  if (now - framesTime > 1000) {
    const fps = frames / ((now - framesTime) / 1000);
    const stats = "FPS:\n " +
      fps.toFixed(2) +
      "\nRender:\n " +
      (totalRenderTime / frames).toFixed(2) +
      "ms";
    fpsLabel.text = stats;
    framesTime = now;
    frames = 0;
    totalRenderTime = 0;
  }
}

async function init() {
  console.log("Initializing Engine");

  const assets = await initAssets();

  engine = await buildEngine(getWebNativeContext());

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
  const updateTime = performance.now();
  const delta = updateTime - lastUpdateTime;
  lastUpdateTime = updateTime;
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

  engine.draw();

  const end = performance.now();

  const renderTime = end - updateTime;

  totalRenderTime += renderTime;
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
