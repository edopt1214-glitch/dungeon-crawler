export const Easing = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
};

export class Tween {
  constructor({ duration, easing = Easing.easeOutQuad, onUpdate, onComplete }) {
    this.duration = duration;
    this.easing = easing;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.elapsed = 0;
    this.done = false;
  }

  update(dtMs) {
    if (this.done) return;
    this.elapsed += dtMs;
    let t = Math.min(1, this.elapsed / this.duration);
    const eased = this.easing(t);
    if (this.onUpdate) this.onUpdate(eased, t);
    if (t >= 1) {
      this.done = true;
      if (this.onComplete) this.onComplete();
    }
  }
}

export function updateTweens(tweens, dtMs) {
  for (const tw of tweens) tw.update(dtMs);
  for (let i = tweens.length - 1; i >= 0; i--) {
    if (tweens[i].done) tweens.splice(i, 1);
  }
}
