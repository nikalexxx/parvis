export const DEBUG_MODE = { enabled: false };

export function debug(mode: boolean) {
  DEBUG_MODE.enabled = mode;
}
