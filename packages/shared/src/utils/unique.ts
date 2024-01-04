let guid = Date.now();
export function uniqueId(prefix = '', length = 36) {
  return `${prefix}${(guid++).toString(length).toLowerCase()}`;
}
