import type { KeyHandler } from 'hotkeys-js';
import type { HotkeysEvent } from 'hotkeys-js';

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
  bindKey(
    key: string,
    handler: HotKeyHandler,
    option?: HotKyeBindOptions,
  ): UnbindKeyDisposer;
  unbindKey(key: string, scope?: string, handler?: HotKeyHandler): void;
  setScope(scopeName: string): void;
  getScope(): string;
  deleteScope(scopeName: string): void;
  getPressedKeyCodes(): number[];
  isPressed(keyCode: number | string): boolean;
  trigger(key: string, scope?: string): void;
  getAllKeyCodes(): Omit<HotkeysEvent, 'method' | 'key'>;
  getPressedKeyString(): string[];
}
