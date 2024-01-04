import { filterXSS } from 'xss';

import { isString } from './is';

export const transformFunction = (code: string, argsName = 'data') => {
  return (originData: any) => {
    const expression = code.trim();
    const data = isString(originData) ? filterXSS(originData) : originData;
    if (!expression) {
      return;
    }

    const newCode = filterXSS(code);
    return new Function(argsName ?? 'data', `${newCode}`)(data);
  };
};

/**
 * Transform and run function. Note that the context passed in needs to contain all variables and you need to catch the exception yourself.
 * 转换并运行函数, 使用的时候需要注意, 传入的context需要包含所有的变量,需要自己捕捉异常
 * @param code
 * @param context
 * @param argName
 */
export const transformAndRunFunction = <Context = any>(
  code: string,
  context: Context,
  argName = 'data',
) => {
  return transformFunction(code, argName)(context);
};
