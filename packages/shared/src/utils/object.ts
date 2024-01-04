export const isEmptyObject = (
  value: unknown,
): value is Record<string, never> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.keys(value).length === 0
  );
};

export const removeObjectUndefined = (obj: { [key: string]: unknown }) => {
  return Object.keys(obj).reduce((acc: { [key: string]: unknown }, key) => {
    if (obj[key] !== undefined) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

export const deepRemoveObjectUndefined = (obj: { [key: string]: unknown }) => {
  return Object.keys(obj).reduce((acc: { [key: string]: unknown }, key) => {
    if (obj[key] !== undefined) {
      if (typeof obj[key] === 'object') {
        acc[key] = deepRemoveObjectUndefined(
          obj[key] as { [key: string]: unknown },
        );
      } else {
        acc[key] = obj[key];
      }
    }
    return acc;
  }, {});
};

export const removeObjectNull = (obj: { [key: string]: unknown }) => {
  return Object.keys(obj).reduce((acc: { [key: string]: unknown }, key) => {
    if (obj[key] !== null) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

export const deepRemoveObjectNull = (obj: { [key: string]: unknown }) => {
  return Object.keys(obj).reduce((acc: { [key: string]: unknown }, key) => {
    if (obj[key] !== null) {
      if (typeof obj[key] === 'object') {
        acc[key] = deepRemoveObjectNull(obj[key] as { [key: string]: unknown });
      } else {
        acc[key] = obj[key];
      }
    }
    return acc;
  }, {});
};

export const removeObjectEmpty = (obj: { [key: string]: unknown }) => {
  return Object.keys(obj).reduce((acc: { [key: string]: unknown }, key) => {
    if (obj[key] !== '' || obj[key] !== null || obj[key] !== undefined) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

export const deepRemoveObjectEmpty = (obj: { [key: string]: unknown }) => {
  return Object.keys(obj).reduce((acc: { [key: string]: unknown }, key) => {
    if (obj[key] !== '' || obj[key] !== null || obj[key] !== undefined) {
      if (typeof obj[key] === 'object') {
        acc[key] = deepRemoveObjectEmpty(
          obj[key] as { [key: string]: unknown },
        );
      } else {
        acc[key] = obj[key];
      }
    }
    return acc;
  }, {});
};
