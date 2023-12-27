import type { VNodeChild } from 'vue';

import type { Arrayable } from './type';

export type VRenderNode = VNodeChild | Arrayable<JSX.Element>;

export type VRenderFunction = (props?: Record<string, any>) => VRenderNode;

export type VRenderContent = VRenderNode | VRenderFunction;

export type ClassName =
  | string
  | Record<string, boolean>
  | (string | Record<string, boolean>)[];
