import { useFieldRequest } from '../../../hooks/useFieldRequest';
import type { SelectProps } from 'antd';
import React, { useEffect } from 'react';
import { HOC_Expand } from '../../../types.d';

type ParamsProps = {
  x_params?: Record<string, any>; // 因为 columns.params 会触发 request 请求，这里使用一个自定义的 x_params 只会触发 withParamsOptions 的更新
  request?: any;
} & SelectProps;


/**
 * 包一层 使用 useFieldRequest 的组件获取 options
 * (自己实现的 x_params 触发的 request ,而不是 params)
 */
export const withDependenciesOptions: HOC_Expand<ParamsProps> = (C) => (props) => {
  const { request, ...rest } = props;

  const { options = [] } = useFieldRequest({
    value: props.value,
    request,
    params: props.x_params,
    onLoaded(_options: any) {
      if (props.value !== undefined && !_options.some(({ value }: any) => value == props.value)) {
        // @ts-ignore
        props.onChange(undefined);
      }
    },
  });

  // 因为需要劫持他的 request 所以不给他传 request
  // @ts-ignore
  return <C {...rest} options={options} />;
};
