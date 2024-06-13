/**
 * 用与修复 pro editableprotable 的column dependencies不生效的问题
 *
 * https://github.com/ant-design/pro-components/issues/2807
 *
 * dependencies 在 editableprotable 虽然做不到更新 params 触发 request 更新，但是通过 fieldProps onchange 可以获得value的更新，使用 react 数据流，这里反过来更新 column 的 params 来修复他
 *
 * 1. 收集所有字段依赖，把依赖按字段名 存成一个 Record<string,string[]> key 是dependency value 是依赖于他的字段。
 *
 * 2. 给 map key 的依赖字段，增加 fieldProps.onChange 。
 *
 * 3. 当 onChange 触发时，保存字段的值，重建 带有 dependencies params 值的 columns数组
 *
 * -------- 多行编辑 -----------
 *
 * 不支持多行编辑！！！！！
 *
 * 因为 column 的 params 是一个对象，不能根据行返回不同对象
 *
 * 不建议使用
 */

import type { ProColumnType } from '@ant-design/pro-table';
import { useMemo, useRef, useState } from 'react';
import useRefState from '../hooks/useRefState';

export function _f_i_x_useDependenciesColumns(columns: any[]) {
  const map = useRef<Record<string, string[]>>({});
  const [values, setValues, rValues] = useRefState<Record<string, any>>({});

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

  const fix_columns = useMemo(() => {
    const paramsMap = {};

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
        params: params,
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
  const map = {};

  for (const col of columns) {
    if (col.dependencies && col.dependencies.length > 0) {
      for (const dep of col.dependencies) {
        if (!map[dep]) {
          map[dep] = [];
        }
        map[dep].push(col.dataIndex);
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
