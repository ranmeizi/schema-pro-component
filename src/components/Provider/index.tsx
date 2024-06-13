import logger from '../../utils/logger';
import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useMemo } from 'react';
import type { ProRenderFieldPropsType } from '@ant-design/pro-provider';
import { ProConfigProvider } from '@ant-design/pro-provider';
import { DEFAULT_VALUE_MAPS } from '../../utils/DefaultValueMaps';

const initValue: Dependencies = {
  /**
   * 外部的请求函数
   */
  async request() {
    logger.error(`request is requiremen`);
  },
  /**
   * ProComponent 会用到的 valueTypeMap
   */
  valueTypeMap: {},
};

export type Request = (url: string, method?: 'POST' | 'GET', params?: any) => Promise<any>;

interface IRequest {
  /**
   * 外部的请求函数
   */
  request: Request;
}

interface IProProvider {
  /**
   * ProComponent 会用到的 valueTypeMap
   */
  valueTypeMap?: Record<string, ProRenderFieldPropsType>;
}

export type Dependencies = IRequest & IProProvider;

export const SchemaComponentContext = createContext<Dependencies>(initValue);

const Provider = ({ valueTypeMap = {}, children, request }: PropsWithChildren<Dependencies>) => {
  const maps = useMemo(() => {
    return {
      ...DEFAULT_VALUE_MAPS,
      ...valueTypeMap,
    };
  }, [valueTypeMap]);

  return (
    <SchemaComponentContext.Provider
      value={{
        request,
      }}
    >
      <ProConfigProvider valueTypeMap={maps}>{children}</ProConfigProvider>
    </SchemaComponentContext.Provider>
  );
};

export default Provider;
