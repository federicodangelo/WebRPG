import { Avatar } from "./avatar.ts";
import { randomIntervalInt, randomDirection } from "./random.ts";

export class Npc extends Avatar {
  private startingDelay = 5;
  private dx = 0;
  private dy = 0;
  private steps = 0;

  public onUpdate() {
    if (this.startingDelay > 0) {
      this.startingDelay--;
      return;
    }

    if (this.steps <= 0) {
      this.dx = randomDirection();
      this.dy = randomDirection();
      this.steps = randomIntervalInt(60, 120);
    }

    this.move(this.dx, this.dy);
    this.steps--;

    super.onUpdate();
  }
}
