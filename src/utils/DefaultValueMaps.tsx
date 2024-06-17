import { WrappedDependenciesOptionsSelect } from '../components/FormFields';
import type { ProRenderFieldPropsType } from '@ant-design/pro-provider';
import React from 'react';
import { useFieldRequest } from '../hooks/useFieldRequest';


function ValueMapRequest(props: any) {
  const { text } = useFieldRequest(props);

  return text;
}

export const DEFAULT_VALUE_MAPS: Record<string, ProRenderFieldPropsType> = {
  SC_DependenciesOptionsSelect: {
    // @ts-ignore
    render(text, { request, valueEnum,proFieldKey }) {
      return (
        <ValueMapRequest value={text} request={request} params={{}} valueEnum={valueEnum} memoFieldKey={proFieldKey} />
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
