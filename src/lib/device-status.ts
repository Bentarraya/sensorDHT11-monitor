export let lastUpdate: number = 0;

export function markUpdate() {
  lastUpdate = Date.now();
}
