import { custom } from 'vue-types';

export const positive = custom((val) => {
  return typeof val === 'number' && val > 0;
});
