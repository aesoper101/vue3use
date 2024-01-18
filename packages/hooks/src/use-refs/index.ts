import type { ComponentPublicInstance, Ref } from 'vue';
import { onBeforeUpdate, ref } from 'vue';

type RefType = HTMLElement | ComponentPublicInstance;
export type RefsValue = Map<string | number, RefType>;
type UseRef = [(key: string | number) => (el: RefType) => void, Ref<RefsValue>];
const useRefs = (): UseRef => {
  const refs = ref<RefsValue>(new Map());

  const setRef = (key: string | number) => (el: RefType) => {
    refs.value.set(key, el);
  };
  onBeforeUpdate(() => {
    refs.value = new Map();
  });
  return [setRef, refs];
};

export default useRefs;
