class Stat {
  public name = "";
  public samples = 0;
  public time = 0;

  constructor(name: string) {
    this.name = name;
  }

  public addSample(t: number) {
    this.time += t;
    this.samples++;
  }

  public reset() {
    this.time = 0;
    this.samples = 0;
  }

  public get averageTime() {
    return this.samples > 0 ? this.time / this.samples : 0;
  }

  public toString() {
    return this.name + "[" + this.samples + "]: " + this.averageTime.toFixed(1);
  }
}

export class EngineStats {
  public render = new Stat("Ren");
  public renderNative = new Stat("RenN");
  public update = new Stat("Upd");

  public reset() {
    this.render.reset();
    this.renderNative.reset();
    this.update.reset();
  }
}
