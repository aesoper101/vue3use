import type { VNodeChild } from 'vue';
import type { JSX } from 'vue/jsx-runtime';

import type { Arrayable } from './type';

export type VRenderNode = VNodeChild | Arrayable<JSX.Element>;

export type VRenderFunction<Props extends Record<string, any> = any> = (
  props?: Props
) => VRenderNode;

export type VRenderContent = VRenderNode | VRenderFunction;

export type ClassName =
  | string
  | Record<string, boolean>
  | (string | Record<string, boolean>)[];
