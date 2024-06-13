import Field from '@ant-design/pro-field';
import { WrappedDependenciesOptionsSelect } from '../components/FormFields';
import type { ProRenderFieldPropsType } from '@ant-design/pro-provider';
import React, { useEffect, useMemo, useState } from 'react';

/**
 * 响应 parms 改变
 * 调用 request 函数
 */
export function useFieldRequest({ value, request, params, valueEnum, onLoaded }: any) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    request(params)
      .then((res: any) => {
        if (res === undefined) {
          throw '请求异常';
        }
        setOptions(res || []);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        onLoaded && onLoaded(res || []);
      })
      .catch((e) => {
        setOptions([]);
      });
  }, [params]);

  const valueMap = useMemo(() => {
    // valueEnum 优先级更高
    if (valueEnum) {
      return valueEnum;
    }

    const vm = {};
    for (const { value: _value, label } of options) {
      vm[_value] = label;
    }
    return vm;
  }, [options, valueEnum]);

  return {
    options,
    text: valueMap[value],
  };
}

function ValueMapRequest(props: any) {
  const { text } = useFieldRequest(props);

  return text;
}

export const DEFAULT_VALUE_MAPS: Record<string, ProRenderFieldPropsType> = {
  SC_DependenciesOptionsSelect: {
    // @ts-ignore
    render(text, { request, params, valueEnum }) {
      return (
        <ValueMapRequest value={text} request={request} params={params} valueEnum={valueEnum} />
      );
    },
    // @ts-ignore
    renderFormItem(_, { fieldProps, request, ...a }, sss) {
      return (
        <WrappedDependenciesOptionsSelect request={request} {...fieldProps} valueType="select" />
      );
    },
  },
};
