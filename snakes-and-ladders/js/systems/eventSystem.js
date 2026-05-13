import { maybeFireRandomEvent, fireEventById } from "../../data/events.js";

export function tickEvents(state) {
  return maybeFireRandomEvent(state);
}

export function triggerEvent(state, id) {
  return fireEventById(state, id);
}
