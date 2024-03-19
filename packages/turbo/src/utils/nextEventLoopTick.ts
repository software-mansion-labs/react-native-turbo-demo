export function nextEventLoopTick(callback: () => void) {
  setTimeout(callback, 1);
}
