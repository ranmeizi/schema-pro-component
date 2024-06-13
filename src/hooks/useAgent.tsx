import { useEffect, useMemo } from 'react';

export function createInvoker(initialValue: any): any {
  const invoker = function () {
    // eslint-disable-next-line prefer-rest-params
    return invoker.value(...arguments);
  };
  invoker.value = initialValue;
  return invoker;
}

export function useAgent<T extends (...rest: any[]) => any>(createFn: () => T, deps: any[]) {
  const invoker = useMemo(() => createInvoker(createFn()), []);

  useEffect(() => {
    // 创建新函数
    // @ts-ignore
    invoker.value = createFn();
  }, deps);

  return invoker;
}
