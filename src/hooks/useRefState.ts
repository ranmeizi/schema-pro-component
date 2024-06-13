import { useRef, useState } from 'react';

export default function useRefState<T>(initialValue?: T) {
  const [v, setV] = useState<T>(initialValue as any);
  const refV = useRef(initialValue);

  const set = function (val: T) {
    refV.current = val;
    setV(val);
  };

  return [v, set, refV] as const;
}
