import {
  type Component,
  type ComponentPublicInstance,
  Fragment,
  type RenderFunction,
  type Slot,
  type Slots,
  type VNode,
  type VNodeTypes,
  cloneVNode,
  createVNode,
  isVNode,
} from 'vue';
import { computed } from 'vue';

import type { VRenderContent, VRenderNode } from '../types';
import { isFunction, isNumber, isString } from './is';

export function renderContent(
  content: VRenderContent,
  props?: Record<string, any>,
  defaultContent?: VRenderContent,
): VRenderNode {
  if (isFunction(content)) {
    return content(props);
  }

  if (!content) {
    return defaultContent ? renderContent(defaultContent) : null;
  }

  if (Array.isArray(content)) {
    return content;
  }

  if (isVNode(content)) {
    return props ? createVNode(content, props) : content;
  }

  return content;
}

export const getSlotFunctionFromSlots = (
  slots: Slots,
  slotName: string,
  slotProps?: Record<string, any>,
) => {
  const slot = slots[slotName];
  if (isFunction(slot)) {
    return slot;
  }
  return () => renderContent(slot, slotProps);
};

export const getSlotFunction = (
  params?: VRenderContent,
  props?: Record<string, any>,
) => {
  return () => renderContent(params, props);
};

export const renderCondition = (
  condition: boolean,
  trueContent: VRenderContent,
  falseContent?: VRenderContent,
) => {
  return condition ? trueContent : falseContent;
};

export default function usePropOrSlot<T extends Record<string, any>>(
  props: T,
  slots: Slots,
  propName: string,
) {
  return computed(
    () => props[propName] || (slots[propName] && slots[propName]!()),
  );
}

export function hasPropOrSlot<T extends Record<string, any>>(
  props: T,
  slots: Slots,
  propName: string,
) {
  return computed(() => Boolean(props[propName] || slots[propName]));
}

export function isVRenderNode(obj: any): obj is VRenderNode {
  return (
    obj === null ||
    obj === undefined ||
    typeof obj === 'string' ||
    typeof obj === 'number' ||
    typeof obj === 'boolean' ||
    (Array.isArray(obj) && obj.every((item) => isVRenderNode(item))) ||
    isVNode(obj)
  );
}

export function isVRenderContent(obj: any): obj is VRenderContent {
  return isVRenderNode(obj) || isFunction(obj);
}

// Quoted from https://github.com/vuejs/core/blob/main/packages/shared/src/shapeFlags.ts
export const enum ShapeFlags {
  ELEMENT = 1,
  FUNCTIONAL_COMPONENT = 1 << 1,
  STATEFUL_COMPONENT = 1 << 2,
  TEXT_CHILDREN = 1 << 3,
  ARRAY_CHILDREN = 1 << 4,
  SLOTS_CHILDREN = 1 << 5,
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEPT_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT,
}

// Quoted from https://github.com/vuejs/core/blob/main/packages/shared/src/patchFlags.ts
export const enum PatchFlags {
  TEXT = 1,
  CLASS = 1 << 1,
  STYLE = 1 << 2,
  PROPS = 1 << 3,
  FULL_PROPS = 1 << 4,
  NEED_HYDRATION = 1 << 5,
  STABLE_FRAGMENT = 1 << 6,
  KEYED_FRAGMENT = 1 << 7,
  UNKEYED_FRAGMENT = 1 << 8,
  NEED_PATCH = 1 << 9,
  DYNAMIC_SLOTS = 1 << 10,
  DEV_ROOT_FRAGMENT = 1 << 11,
  HOISTED = -1,
  BAIL = -2,
}

export const getValueFromSlotsOrProps = (
  name: string,
  props?: Record<string, any>,
  slots?: Slots,
) => {
  if (slots?.[name]) {
    return slots[name];
  }
  if (props?.[name]) {
    return () => props[name];
  }
  return undefined;
};

export const isComponentInstance = (
  value: any,
): value is ComponentPublicInstance => {
  return value?.$ !== undefined;
};

export const isElement = (vn: VNode) => {
  return Boolean(vn && vn.shapeFlag & ShapeFlags.ELEMENT);
};

export const isComponent = (
  vn: VNode,
  type?: VNodeTypes,
): type is Component => {
  return Boolean(vn && vn.shapeFlag & ShapeFlags.COMPONENT);
};

export const isText = (
  vn: VNode,
  children: VNode['children'],
): children is string => {
  return Boolean(vn && vn.shapeFlag & ShapeFlags.TEXT_CHILDREN);
};

export const isNamedComponent = (child: VNode, name: string) => {
  return isComponent(child, child.type) && child.type.name === name;
};

export const isTextChildren = (
  child: VNode,
  children: VNode['children'],
): children is string => {
  return Boolean(child && child.shapeFlag & 8);
};

export const isArrayChildren = (
  vn: VNode,
  children: VNode['children'],
): children is VNode[] => {
  return Boolean(vn && vn.shapeFlag & ShapeFlags.ARRAY_CHILDREN);
};

export const isSlotsChildren = (
  vn: VNode,
  children: VNode['children'],
): children is Slots => {
  return Boolean(vn && vn.shapeFlag & ShapeFlags.SLOTS_CHILDREN);
};

export const getChildrenString = (children: VNode[]): string => {
  let text = '';
  for (const child of children) {
    if (isString(child) || isNumber(child)) {
      text += String(child);
    } else if (isTextChildren(child, child.children)) {
      text += child.children;
    } else if (isArrayChildren(child, child.children)) {
      text += getChildrenString(child.children);
    } else if (isSlotsChildren(child, child.children)) {
      const _children = child.children.default?.();
      if (_children) {
        text += getChildrenString(_children);
      }
    }
  }

  return text;
};

export const getVNodeChildrenString = (vn: VNode): string => {
  if (isText(vn, vn.children)) {
    return vn.children;
  }
  // Used to splice the content of sub-components and return the text of all sub-components
  let text = '';
  if (isArrayChildren(vn, vn.children)) {
    for (const child of vn.children) {
      text += getVNodeChildrenString(child);
    }
  } else if (isSlotsChildren(vn, vn.children)) {
    const children = vn.children.default?.() ?? [];
    for (const child of children) {
      text += getVNodeChildrenString(child);
    }
  }
  return text;
};

export const getChildrenFunc = (vn: VNode): RenderFunction | undefined => {
  if (isTextChildren(vn, vn.children) || isArrayChildren(vn, vn.children)) {
    return (() => vn.children) as RenderFunction;
  }
  if (isSlotsChildren(vn, vn.children)) {
    return vn.children.default;
  }
  return undefined;
};

export const getChildrenTextOrSlot = (vn: VNode): string | Slot | undefined => {
  if (isText(vn, vn.children)) {
    return vn.children;
  }
  if (isSlotsChildren(vn, vn.children)) {
    const children = vn.children.default?.();
    // 如果slot的内容是文字，优先返回字符串
    if (children && children.length === 1) {
      const child = children[0];
      if (isTextChildren(child, child.children)) {
        return child.children;
      }
    }
    return vn.children.default;
  }
  if (isArrayChildren(vn, vn.children)) {
    if (vn.children.length === 1) {
      const child = vn.children[0];
      if (isTextChildren(child, child.children)) {
        return child.children;
      }
    }
    return () => vn.children as VNode[];
  }
  return undefined;
};

export const getFirstComponent = (
  children: VNode[] | undefined,
): VNode | undefined => {
  if (!children) {
    return undefined;
  }

  for (const child of children) {
    if (isElement(child) || isComponent(child)) {
      return child;
    }
    // If the current node is not a component, continue to find subcomponents
    if (isArrayChildren(child, child.children)) {
      const result = getFirstComponent(child.children);
      if (result) return result;
    } else if (isSlotsChildren(child, child.children)) {
      const children = child.children.default?.();
      if (children) {
        const result = getFirstComponent(children);
        if (result) return result;
      }
    } else if (Array.isArray(child)) {
      const result = getFirstComponent(child);
      if (result) return result;
    }
  }

  return undefined;
};

export const getComponentNumber = (vNodes: VNode[], componentName: string) => {
  let count = 0;
  for (const item of vNodes) {
    if (isComponent(item, item.type) && item.type.name === componentName) {
      count++;
    } else if (isArrayChildren(item, item.children)) {
      count += getComponentNumber(item.children, componentName);
    }
  }
  return count;
};

export const foreachComponent = (
  children: VNode[],
  name: string,
  cb: (node: VNode) => void,
) => {
  for (const item of children) {
    if (isComponent(item, item.type) && item.type.name === name) {
      cb(item);
    }
    if (isArrayChildren(item, item.children)) {
      foreachComponent(item.children, name, cb);
    }
  }
};

export const isEmptyChildren = (children?: VNode[]) => {
  if (!children) {
    return true;
  }

  for (const item of children) {
    if (item.children) {
      return false;
    }
  }

  return true;
};

export const getChildrenComponents = (
  children: VNode[],
  name: string,
  props?:
    | Record<string, any>
    | ((node: VNode, index: number) => Record<string, any>),
  startIndex = 0,
): VNode[] => {
  const result = [];
  for (const item of children) {
    if (isNamedComponent(item, name)) {
      if (props) {
        const index: number = startIndex + result.length;
        const extraProps = isFunction(props) ? props(item, index) : props;
        result.push(cloneVNode(item, extraProps, true));
      } else {
        result.push(item);
      }
    } else if (isArrayChildren(item, item.children)) {
      result.push(
        ...getChildrenComponents(item.children, name, props, result.length),
      );
    } else if (isSlotsChildren(item, item.children)) {
      const defaultChildren = item.children.default?.() ?? [];
      result.push(
        ...getChildrenComponents(defaultChildren, name, props, result.length),
      );
    }
  }
  return result;
};

export const mergeFirstChild = (
  children: VNode[] | undefined,
  extraProps: Record<string, any> | ((vn: VNode) => Record<string, any>),
): boolean => {
  if (children && children.length > 0) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (isElement(child) || isComponent(child)) {
        const props = isFunction(extraProps) ? extraProps(child) : extraProps;
        children[i] = cloneVNode(child, props, true);
        return true;
      }
      const _children = getChildrenArray(child);
      if (_children && _children.length > 0) {
        const result = mergeFirstChild(_children, extraProps);
        if (result) return true;
      }
    }
  }
  return false;
};

export const getChildrenArray = (vn: VNode): VNode[] | undefined => {
  if (isArrayChildren(vn, vn.children)) {
    return vn.children;
  }
  if (Array.isArray(vn)) {
    return vn;
  }
  return undefined;
};

export const getFirstElementFromVNode = (
  vn: VNode,
): HTMLElement | undefined => {
  if (isElement(vn)) {
    return vn.el as HTMLElement;
  }
  if (isComponent(vn)) {
    if ((vn.el as Node)?.nodeType === 1) {
      return vn.el as HTMLElement;
    }
    if (vn.component?.subTree) {
      const ele = getFirstElementFromVNode(vn.component.subTree);
      if (ele) return ele;
    }
  } else {
    const children = getChildrenArray(vn);
    return getFirstElementFromChildren(children);
  }
  return undefined;
};

export const getFirstElementFromTemplateRef = (
  target: HTMLElement | ComponentPublicInstance | undefined,
) => {
  if (isComponentInstance(target)) {
    return getFirstElementFromVNode(target.$.subTree);
  }
  return target;
};

export const getFirstElementFromChildren = (
  children: VNode[] | undefined,
): HTMLElement | undefined => {
  if (children && children.length > 0) {
    for (const child of children) {
      const element = getFirstElementFromVNode(child);
      if (element) return element;
    }
  }
  return undefined;
};

export const getComponentsFromVNode = (vn: VNode, name: string) => {
  const components: number[] = [];

  if (isComponent(vn, vn.type)) {
    if (vn.type.name === name) {
      if (vn.component) {
        components.push(vn.component.uid);
      }
    } else if (vn.component?.subTree) {
      components.push(...getComponentsFromVNode(vn.component.subTree, name));
    }
  } else {
    const children = getChildrenArray(vn);
    if (children) {
      components.push(...getComponentsFromChildren(children, name));
    }
  }

  return components;
};

export const getComponentsFromChildren = (
  children: VNode[] | undefined,
  name: string,
) => {
  const components: number[] = [];

  if (children && children.length > 0) {
    for (const child of children) {
      components.push(...getComponentsFromVNode(child, name));
    }
  }

  return components;
};

export const isValidElement = (element: any): element is VNode => {
  if (Array.isArray(element) && element.length === 1) {
    element = element[0];
  }
  return element && element.__v_isVNode && typeof element.type !== 'symbol';
};

export const isFragment = (vn: any) => {
  return vn.length === 1 && vn[0].type === Fragment;
};
