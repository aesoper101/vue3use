export type JSONValue =
  | boolean
  | string
  | number
  | null
  | undefined
  | JSONArray
  | JSONObject;

export type JSONArray = JSONValue[];

export interface JSONObject {
  [key: string]: JSONValue;
}

export interface JSFunction {
  type: 'JSFunction';

  /**
   * 函数定义，或直接函数表达式
   */
  value: string;

  [extra: string]: any;
}

export interface JSExpression {
  type: 'JSExpression';
  /**
   * 表达式字符串
   */
  value: string;

  [extra: string]: any;
}

export type JSONData =
  | JSONValue
  | JSExpression
  | JSFunction
  | JSONDataArray
  | JSONDataObject;

export type JSONDataArray = JSONData[];

export interface JSONDataObject {
  [key: string]: JSONData;
}

export function isJSExpression(data: any): data is JSExpression {
  return data && data.type === 'JSExpression';
}

export function isJSFunction(data: any): data is JSFunction {
  return data && data.type === 'JSFunction';
}
