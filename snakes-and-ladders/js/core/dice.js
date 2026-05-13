import { randInt } from "./rng.js";

export function rollDie(rng) {
  return randInt(rng, 1, 6);
}
