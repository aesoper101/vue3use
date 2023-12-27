export const throwException = (message: string | Error) => {
  throw new Error(message instanceof Error ? message.message : message);
};
