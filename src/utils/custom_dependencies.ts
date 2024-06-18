/**
 * 先看 __fix_pro_dependencies__.ts
 *
 * 不同于 __fix_pro_dependencies__ 的是，这里通过 修改 fieldProps.x_params 的自定义字段
 */

import type { ProColumnType } from '@ant-design/pro-table';
import { useMemo, useRef } from 'react';
import useRefState from '../hooks/useRefState';

/**
 * 使用 react 数据流外部存储变化的 params 以更新 columns，
 * 
 * 使用自定义 filedProps.x_params 让自定义组件重新发起 request
 */
export function useCustomDependenciesColumns(columns: any[]) {
  const map = useRef<Record<string, string[]>>({});
  const [values, setValues, rValues] = useRefState<Record<string, any>>({});

  // 添加 onChange 监听
  const baseFixColumns: ProColumnType[] = useMemo(() => {
    map.current = getMap(columns);

    return columns.map((col) => {
      return {
        ...col,
        fieldProps: {
          ...(col.fieldProps || {}),
          onChange: (value: any) => {
            setValues({
              ...rValues.current,
              [col.dataIndex as string]: value,
            });
          },
        },
      };
    });
  }, [columns]);

  // 设置 x_params
  const fix_columns = useMemo(() => {
    const paramsMap: Record<string, any> = {};

    for (const [provider, consumers] of Object.entries(map.current)) {
      for (const consumer of consumers) {
        if (paramsMap[consumer]) {
          paramsMap[consumer][provider] = values[provider];
        } else {
          paramsMap[consumer] = {
            [provider]: values[provider],
          };
        }
      }
    }

    return baseFixColumns.map((col) => {
      const key: string = String(col.dataIndex) || '';

      let params = col.params || {};

      if (key in paramsMap) {
        if (diff(paramsMap[key], params)) {
          params = paramsMap[key];
        }
      }

      return {
        ...col,
        fieldProps: {
          ...(col.fieldProps || {}),
          x_params: params,
        },
      };
    });
  }, [baseFixColumns, values]);

  // 重置
  function reset(record = {}) {
    setValues(record);
  }

  return [fix_columns, reset] as const;
}

function getMap(columns: ProColumnType[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};

  for (const col of columns) {
    if (col.dependencies && col.dependencies.length > 0) {
      for (const dep of col.dependencies) {
        if (!map[dep]) {
          map[dep] = [];
        }
        map[dep].push(String(col.dataIndex));
      }
    }
  }

  return map;
}

function diff<T extends Record<string, any>>(obj1: T, obj2: T) {
  const target = Object.keys(obj1).length > Object.keys(obj2).length ? obj1 : obj2;

  for (const key in target) {
    if (obj1[key] !== obj2[key]) {
      return true;
    }
  }

  return false;
}
