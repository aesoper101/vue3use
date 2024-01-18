const availablePrefixs = ['moz', 'ms', 'webkit'];

function requestAnimationFramePolyfill() {
  let lastTime = 0;
  return function (callback: (time: number) => any) {
    const currTime = new Date().getTime();
    const timeToCall = Math.max(0, 16 - (currTime - lastTime));
    const id = window.setTimeout(function () {
      callback(currTime + timeToCall);
    }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
}

export function getRequestAnimationFrame() {
  if (typeof window === 'undefined') {
    return () => {};
  }
  if (window.requestAnimationFrame) {
    // https://github.com/vuejs/vue/issues/4465
    return window.requestAnimationFrame.bind(window);
  }

  const prefix = availablePrefixs.filter(
    (key) => `${key}RequestAnimationFrame` in window,
  )[0];

  //@ts-ignore
  return prefix
    ? //@ts-ignore
      window[`${prefix}RequestAnimationFrame`]
    : requestAnimationFramePolyfill();
}

export function cancelRequestAnimationFrame(id: number) {
  if (typeof window === 'undefined') {
    return null;
  }
  if (window.cancelAnimationFrame) {
    return window.cancelAnimationFrame(id);
  }
  const prefix = availablePrefixs.filter(
    (key) =>
      `${key}CancelAnimationFrame` in window ||
      `${key}CancelRequestAnimationFrame` in window,
  )[0];

  const cancelAnimationFrame =
    //@ts-ignore
    window[`${prefix}CancelAnimationFrame`] ||
    //@ts-ignore
    window[`${prefix}CancelRequestAnimationFrame`];

  return prefix
    ? //@ts-ignore
      cancelAnimationFrame.call(this, id)
    : clearTimeout(id);
}
