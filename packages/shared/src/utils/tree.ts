import type { UID } from '../types';
import { isNumber } from './is';
import { hasOwnProperty } from './object';

interface INodeProps<T = any> {
  children?: T[];

  [key: string]: any;
}

interface IMapNode<T = any> {
  id: UID;
  node: T;
  parent?: UID;
  children?: UID[];
  prev?: UID;
  next?: UID;
}

interface INodeTree<T = any> {
  /**
   * The count of tree node
   * 树节点的数量
   */
  count: number;

  /**
   * The Raw tree data
   * 原始树数据
   */
  obj: T;

  /**
   * Returns the tree informations about the node found by id,
   * Contains
   * - the parent's id
   * - the previous node's id
   * - the next node's id
   * - and the collection of children's id
   * 返回通过id找到的节点的树信息，
   * 包含
   * - 父节点的id
   * - 前一个节点的id
   * - 后一个节点的id
   * - 和子节点的id集合
   * @param id
   */
  getHashMap(id: UID): IMapNode<T> | null;

  /**
   * Returns the node found in tree by id
   * 返回通过id在树中找到的节点
   * @param id
   */
  getNode(id: UID): T | null;

  /**
   * Remove the node found in tree by id
   * 删除通过id在树中找到的节点
   * @param id
   */
  removeNode(id: UID): T | null;

  /**
   * Update the node found in tree by id
   * 更新通过id在树中找到的节点
   * @param id
   * @param extra
   */
  updateNode(id: UID, extra: T): T | null;

  /**
   * Insert an object whose parent node is found by parentId and position is i into the tree
   * 将父节点通过parentId和位置i找到的对象插入到树中
   * @param obj
   * @param parentId
   * @param i
   */
  insertNode(obj: T, parentId: UID, i: number): IMapNode<T> | null;

  /**
   * Insert an object before the destiny node whose id is `destId`
   * 在id为`destId`的目标节点之前插入一个对象
   * @param obj
   * @param destId
   */
  insertBefore(obj: T, destId: UID): IMapNode<T> | null;

  /**
   * Insert an object after the destiny node whose id is `destId`
   * 在id为`destId`的目标节点之后插入一个对象
   * @param obj
   * @param destId
   */
  insertAfter(obj: T, destId: UID): IMapNode<T> | null;

  /**
   * Prepend an object into tree
   * 将对象前置到树中
   * @param obj
   * @param destId
   */
  prepend(obj: T, destId: UID): IMapNode<T> | null;

  /**
   * Append an object into tree
   * 将对象附加到树中
   * @param obj
   * @param destId
   */
  append(obj: T, destId: UID): IMapNode<T> | null;

  /**
   * Returns if the next node exists
   * 返回下一个节点是否存在
   *
   * @param id
   */
  hasNext(id: UID): boolean;

  /**
   * Iterate the tree
   * 迭代树
   * @param callback
   */
  iterate(callback: (node: T, index: number, parent?: T) => void): void;
}

/**
 * Tree util
 * 树工具
 */
export class TreeUtil<T extends INodeProps> implements INodeTree<T> {
  /**
   * The count of tree node
   * 树节点的数量
   */
  count: number = 0;

  /**
   * The Raw tree data
   * 原始树数据
   */
  obj: T;

  /**
   * The tree node map
   * 树节点映射
   */
  map: Map<UID, IMapNode<T>> = new Map();

  /**
   * The tree node map
   * 树节点映射
   */
  mapByParent: Map<UID, UID[]> = new Map();

  /**
   * The tree node map
   * 树节点映射
   */
  mapByPrev: Map<UID, UID> = new Map();

  /**
   * The tree node map
   * 树节点映射
   */
  mapByNext: Map<UID, UID> = new Map();

  /**
   * The tree node map
   * 树节点映射
   */
  mapByChildren: Map<UID, UID[]> = new Map();

  static New<T extends INodeProps>(
    obj: T,
    uidKey: string = 'id',
  ): INodeTree<T> {
    return new TreeUtil<T>(obj, uidKey);
  }

  constructor(
    obj: T,
    private readonly uidKey: string = 'id',
  ) {
    this.obj = obj;
  }

  private getUID(obj: T): UID {
    return hasOwnProperty(obj, this.uidKey) ? obj[this.uidKey] : obj.id;
  }

  private handleParentId(parentId: UID | undefined): UID {
    const uid = this.getUID(this.obj);
    if (isNumber(uid)) {
      return parentId ? Number(parentId) : 0;
    }
    return parentId || '';
  }

  /**
   * Returns the tree informations about the node found by id,
   * Contains
   * - the parent's id
   * - the previous node's id
   * - the next node's id
   * - and the collection of children's id
   * 返回通过id找到的节点的树信息，
   * 包含
   * - 父节点的id
   * - 前一个节点的id
   * - 后一个节点的id
   * - 和子节点的id集合
   * @param id
   */
  getHashMap(id: UID): IMapNode<T> | null {
    return this.map.get(id) || null;
  }

  /**
   * Returns the node found in tree by id
   * 返回通过id在树中找到的节点
   * @param id
   */
  getNode(id: UID): T | null {
    const node = this.map.get(id);
    return node ? node.node : null;
  }

  /**
   * Remove the node found in tree by id
   * 删除通过id在
   * @param id
   * @returns
   */
  removeNode(id: UID): T | null {
    const node = this.map.get(id);
    if (!node) {
      return null;
    }

    const { parent, prev, next, children } = node;
    // Remove from parent
    if (parent) {
      const parentChildren = this.mapByChildren.get(parent);
      if (parentChildren) {
        const index = parentChildren.indexOf(id);
        if (index !== -1) {
          parentChildren.splice(index, 1);
        }
      }
    }

    // Remove from prev
    if (prev) {
      this.mapByNext.set(prev, next || '');
    }

    // Remove from next
    if (next) {
      this.mapByPrev.set(next, prev || '');
    }

    // Remove from children
    if (children) {
      for (const child of children) {
        this.mapByParent.delete(child);
      }
    }

    // Remove from map
    this.map.delete(id);
    this.mapByParent.delete(id);
    this.mapByPrev.delete(id);
    this.mapByNext.delete(id);
    this.mapByChildren.delete(id);

    this.count -= 1;

    return node.node;
  }

  /**
   * Update the node found in tree by id
   * 更新通过id在树中找到的节点
   * @param id
   * @param extra
   */
  updateNode(id: UID, extra: T): T | null {
    const node = this.map.get(id);
    if (node) {
      Object.assign(node.node, extra);
      return node.node;
    }
    return null;
  }

  /**
   * Insert an object whose parent node is found by parentId and position is i into the tree
   * 将父节点通过parentId和位置i找到的对象插入到树中
   * @param obj
   * @param parentId
   * @param i
   */
  insertNode(obj: T, parentId: UID, i: number): IMapNode<T> | null {
    const parent = this.map.get(parentId);
    if (!parent) {
      return null;
    }

    const id = this.getUID(obj);
    const prev = parent.children?.[i - 1];
    const next = parent.children?.[i];
    const node: IMapNode<T> = {
      id,
      node: obj,
      parent: this.handleParentId(parentId),
      prev,
      next,
    };

    // Add to map
    this.map.set(id, node);

    // Add to parent
    const parentChildren = this.mapByChildren.get(parentId);
    if (parentChildren) {
      parentChildren.splice(i, 0, id);
    } else {
      this.mapByChildren.set(parentId, [id]);
    }

    // Add to prev
    if (prev) {
      this.mapByNext.set(prev, id);
    }

    // Add to next
    if (next) {
      this.mapByPrev.set(next, id);
    }

    // Add to children
    if (this.mapByParent.get(id)) {
      this.mapByParent.get(id)?.push(parentId);
    } else {
      this.mapByParent.set(id, [parentId]);
    }

    this.count += 1;

    return node;
  }

  /**
   * Insert an object before the destiny node whose id is `destId`
   * 在id为`destId`的目标节点之前插入一个对象
   * @param obj
   * @param destId
   */
  insertBefore(obj: T, destId: UID): IMapNode<T> | null {
    const dest = this.map.get(destId);
    if (!dest) {
      return null;
    }

    const parentId = this.handleParentId(dest.parent);
    const parent = this.map.get(parentId);
    if (!parent) {
      return null;
    }

    const i = parent.children?.indexOf(destId) || 0;
    return this.insertNode(obj, parentId, i);
  }

  /**
   * Insert an object after the destiny node whose id is `destId`
   * 在id为`destId`的目标节点之后插入一个对象
   * @param obj
   * @param destId
   */
  insertAfter(obj: T, destId: UID): IMapNode<T> | null {
    const dest = this.map.get(destId);
    if (!dest) {
      return null;
    }

    const parentId = this.handleParentId(dest.parent);
    const parent = this.map.get(parentId);
    if (!parent) {
      return null;
    }

    const i = parent.children?.indexOf(destId) || 0;
    return this.insertNode(obj, parentId, i + 1);
  }

  /**
   * Prepend an object into tree
   * 将对象前置到树中
   * @param obj
   * @param destId
   */
  prepend(obj: T, destId: UID): IMapNode<T> | null {
    const dest = this.map.get(destId);
    if (!dest) {
      return null;
    }

    const parentId = this.handleParentId(dest.parent);
    return this.insertNode(obj, parentId, 0);
  }

  /**
   * Append an object into tree
   * 将对象附加到树中
   * @param obj
   * @param destId
   */
  append(obj: T, destId: UID): IMapNode<T> | null {
    const dest = this.map.get(destId);
    if (!dest) {
      return null;
    }

    const parentId = this.handleParentId(dest.parent);
    const parent = this.map.get(parentId);
    if (!parent) {
      return null;
    }

    const i = parent.children?.length || 0;
    return this.insertNode(obj, parentId, i);
  }

  /**
   * Returns if the next node exists
   * 返回下一个节点是否存在
   *
   * @param id
   */
  hasNext(id: UID): boolean {
    return !!this.mapByNext.get(id);
  }

  /**
   * Iterate the tree
   * 迭代树
   * @param callback
   */
  iterate(callback: (node: T, index: number, parent?: T) => void): void {
    const innerIterate = (node: T, index: number, parent?: T) => {
      callback(node, index, parent);
      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          innerIterate(node.children[i], i, node);
        }
      }
    };

    innerIterate(this.obj, 0);
  }
}
