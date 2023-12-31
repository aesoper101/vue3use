import {
  type ComputedRef,
  type PropType,
  computed,
  defineComponent,
  inject,
  provide,
} from 'vue';

export function createContext<T>(defaultValue: T) {
  const contextSymbolKey = Symbol('CREATE_CONTEXT_KEY');
  // eslint-disable-next-line vue/one-component-per-file
  const Provider = defineComponent({
    props: {
      value: {
        type: [
          Object,
          Number,
          String,
          Boolean,
          null,
          undefined,
          Function,
        ] as PropType<T>,
        required: true,
      },
    },
    setup(props, { slots }) {
      provide(
        contextSymbolKey,
        computed(() => props.value || defaultValue),
      );
      return () => {
        return slots.default?.();
      };
    },
  });

  const useContext = () =>
    inject<ComputedRef<T>>(
      contextSymbolKey,
      computed(() => defaultValue),
    );

  // eslint-disable-next-line vue/one-component-per-file
  const Consumer = defineComponent({
    setup(props, ctx) {
      const value = useContext();
      return () => ctx.slots.default?.(value.value);
    },
  });

  return {
    Provider,
    Consumer,
    useContext,
  };
}
