import { FixedColor, Engine } from "engine/types.ts";
import { buildEngine, destroyEngine } from "engine/engine.ts";
import { LabelWidget } from "engine/widgets/label.ts";
import { initGame, updateGame, mainUI } from "game/game.ts";
import { getWebNativeContext } from "./native/web.ts";
import { initAssets } from "./native/assets.ts";

const TARGET_FPS = 30;

let engine: Engine;
let fpsLabel: LabelWidget;

let totalRenderTime = 0;
let frames = 0;
let framesTime = performance.now();

function updateFps() {
  const now = performance.now();
  frames++;
  if (now - framesTime > 1000) {
    const fps = frames / ((now - framesTime) / 1000);
    const stats =
      "FPS: " +
      fps.toFixed(2) +
      "\nRender: " +
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

  initGame(engine, assets);

  console.log("Game Initialized");

  fpsLabel = new LabelWidget(
    assets.defaultFont,
    "FPS: 0.00\nRender: 0.00ms",
    FixedColor.White,
    mainUI.panel2.backColor
  );

  fpsLabel.parent = mainUI.panel2;

  return engine;
}

let lastUpdateTime = performance.now();
let timeToNextUpdate = 0;

function update() {
  const updateTime = performance.now();
  const delta = updateTime - lastUpdateTime;
  lastUpdateTime = updateTime;
  timeToNextUpdate -= delta;
  if (timeToNextUpdate < -1000) timeToNextUpdate = -1000;

  if (timeToNextUpdate > 0.1) return;

  timeToNextUpdate += 1000 / TARGET_FPS;

  updateFps();

  engine.update();

  updateGame(engine);

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
