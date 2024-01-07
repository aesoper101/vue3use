import type { HotkeysEvent, KeyHandler } from 'hotkeys-js';

export type HotKeyHandler = KeyHandler;
export interface HotKyeBindOptions {
  scope?: string;
  element?: HTMLElement | null;
  keyup?: boolean | null;
  keydown?: boolean | null;
  capture?: boolean;
  splitKey?: string;
  single?: boolean;
}

export interface UnbindKeyDisposer {
  (): void;
}

export interface HotKyeManager {
  isPressed: (keyCode: number | string) => boolean;
  getPressedKeyCodes: () => number[];
  getAllKeyCodes: () => Omit<HotkeysEvent, 'method' | 'key'>[];
  getPressedKeyString: () => string[];
  deleteScope: (scopeName: string) => void;
  trigger: (key: string, scope?: string) => void;
  setScope: (scopeName: string) => void;
  unbindKey: (key: string, scope?: string, handler?: HotKeyHandler) => void;
  bindKey: (
    key: string,
    handler: HotKeyHandler,
    options?: HotKyeBindOptions,
  ) => () => void;
  getScope: () => string;
}
