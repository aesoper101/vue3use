import { useMemo } from '../use-memo';
import useState from '../use-state';

export function useBoolean(initialState = false) {
  const [value, setValue] = useState(initialState);
  const callbacks = useMemo(
    () => ({
      on: () => setValue(true),
      off: () => setValue(false),
      toggle: () => setValue(!value.value),
    }),
    []
  );

  return [value, callbacks] as const;
}
