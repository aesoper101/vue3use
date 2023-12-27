import hotkeys from 'hotkeys-js';

import type {
  HotKeyHandler,
  HotKyeBindOptions,
  HotKyeManager,
} from './interface';

export const useHotKey = (): HotKyeManager => {
  const bindKey = (
    key: string,
    handler: HotKeyHandler,
    options?: HotKyeBindOptions,
  ) => {
    hotkeys(key, options || {}, handler);

    return () => {
      unbindKey(key, options?.scope, handler);
    };
  };

  const unbindKey = (key: string, scope?: string, handler?: HotKeyHandler) => {
    if (scope && handler) {
      hotkeys.unbind(key, scope, handler);
    } else if (scope) {
      hotkeys.unbind(key, scope);
    } else {
      hotkeys.unbind(key);
    }
  };

  const setScope = (scopeName: string) => {
    hotkeys.setScope(scopeName);
  };

  const getScope = () => {
    return hotkeys.getScope();
  };

  const deleteScope = (scopeName: string) => {
    hotkeys.deleteScope(scopeName);
  };

  const getPressedKeyCodes = () => {
    return hotkeys.getPressedKeyCodes();
  };

  const isPressed = (keyCode: number | string) => {
    if (typeof keyCode === 'string') {
      return hotkeys.isPressed(keyCode);
    }
    return hotkeys.isPressed(keyCode);
  };

  const trigger = (key: string, scope?: string) => {
    hotkeys.trigger(key);
  };

  const getAllKeyCodes = () => {
    return hotkeys.getAllKeyCodes();
  };

  const getPressedKeyString = () => {
    return hotkeys.getPressedKeyString();
  };

  return {
    bindKey,
    unbindKey,
    setScope,
    getScope,
    deleteScope,
    getPressedKeyCodes,
    isPressed,
    trigger,
    getAllKeyCodes,
    getPressedKeyString,
  };
};
