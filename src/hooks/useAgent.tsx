import { useEffect, useMemo } from 'react';

/**
 * 创建函数代理，以react ref/memo 形式存在于组件中
 * 
 * 通过修改value，绑定函数
 */
export function createInvoker(initialValue: any): any {
  const invoker = function () {
    // eslint-disable-next-line prefer-rest-params
    return invoker.value(...arguments);
  };
  invoker.value = initialValue;
  return invoker;
}

/**
 * memo 方式 封装 createInvoker
 * 
 * 用 useEffect deps 获取上下文重新绑定的函数
 */
export function useAgent<T extends (...rest: any[]) => any>(createFn: () => T, deps: any[]) {
  const invoker = useMemo(() => createInvoker(createFn()), []);

  useEffect(() => {
    // 创建新函数
    // @ts-ignore
    invoker.value = createFn();
  }, deps);

  return invoker;
}
