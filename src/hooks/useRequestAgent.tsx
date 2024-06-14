/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import type React from 'react';
import { useContext, useMemo } from 'react';
import { SchemaComponentContext } from '../components/Provider';
import type { Request } from '../components/Provider';
import { message } from 'antd';
import { useAgent } from './useAgent';

type UseRequestOptions = {
  commonParams?: Record<string, any>;
};

export function createInvoker(initialValue: any): any {
  const invoker = function () {
    return invoker.value(...arguments);
  };
  invoker.value = initialValue;
  return invoker;
}

/**
 * 1. 获取外部 request 函数
 * 2. 拼接公共参数
 */
export default function useRequestAgent({ commonParams = {} }: UseRequestOptions = {}) {
  const { request } = useContext(SchemaComponentContext);

  const req: Request = useAgent(
    () => (url, method, params) => {
      // 合并 commonParams
      return request(url, method, {
        ...commonParams,
        ...params,
      });
    },
    [commonParams, request],
  );

  return req;
}

type MergedParamsCtx = {
  vars: Record<string, any>;
};

export type MergedParamsConfig = {
  vars?: string[];
};

// 从 var 中提取请求通用参数
export function useMergedParams(ctx: MergedParamsCtx, config: MergedParamsConfig = {}) {
  const varParams = useMemo(() => {
    const params = {};
    const vars = config.vars || [];

    for (const k of vars) {
      params[k] = ctx.vars[k];
    }

    return params;
  }, [ctx.vars, config.vars]);

  return useMemo(() => {
    return {
      ...varParams,
    };
  }, [varParams]);
}

/**
 * 标准化请求行为
 *
 * 这里标准化，一是为了使用方便，二是为了组件在外部按 name 去做 override。
 */

export type ActionFns = {
  queryList: (params: any) => Promise<{
    data: any;
    success: boolean;
    total: number;
  }>;
  create: (params: any, record: any) => Promise<any>;
  updateById: (params: any, record: any) => Promise<any>;
  deleteById: (params: any, record: any) => Promise<any>;
};

// 覆盖用
export type OverrideActionFns = Partial<ActionFns>;

export function useTableAction(
  {
    request,
    actions,
    rowKey,
  }: {
    request: Request;
    actions: Partial<Record<keyof ActionFns, string>>;
    rowKey?: React.Key;
  },
  overrideActions: Partial<ActionFns> = {},
): ActionFns {
  // 获取表格数据
  const queryList = useAgent(
    () =>
      overrideActions.queryList
        ? overrideActions.queryList
        : (params) => {
            if (!actions.queryList) {
              return Promise.reject('不支持查询');
            }

            return request(actions.queryList, 'GET', params);
          },
    [request, overrideActions.queryList],
  );

  // 创建一行
  const create = useAgent(
    () =>
      overrideActions.create
        ? overrideActions.create
        : (params) => {
            if (!actions.create) {
              return Promise.reject('不支持创建');
            }

            // 删除前端创建的id
            if (params[String(rowKey)] === 'addnew') {
              delete params[String(rowKey)];
            }

            return request(actions.create, 'POST', params).then((res) => {
              message.success('创建成功');
            }).catch(()=>{
              message.success('创建失败')
            })
          },
    [request, overrideActions.create],
  );

  // 更新一行
  const updateById = useAgent(
    () =>
      overrideActions.updateById
        ? overrideActions.updateById
        : (params) => {
            if (!actions.updateById) {
              return Promise.reject('不支持更新');
            }

            return request(actions.updateById, 'POST', params).then((res) => {
              message.success('更新成功');
            }).catch(()=>{
              message.success('更新失败')
            })
          },
    [request, overrideActions.updateById],
  );

  // 删除一行
  const deleteById = useAgent(
    () =>
      overrideActions.deleteById
        ? overrideActions.deleteById
        : (params: any) => {
            if (!actions.deleteById) {
              return Promise.reject('不支持删除');
            }

            return request(actions.deleteById, 'POST', params).then((res) => {
              message.success('删除成功');
            }).catch(()=>{
              message.success('删除失败')
            })
          },
    [request, overrideActions.deleteById],
  );

  return {
    queryList,
    create,
    updateById,
    deleteById,
  };
}
