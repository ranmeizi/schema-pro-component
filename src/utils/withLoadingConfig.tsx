import React, { useContext, useEffect, useState } from 'react';
import { Spin } from 'antd';
import { SchemaComponentContext } from '../components/Provider';
import { HOC_Inject } from '../types.d';

/** 获取 props 的 url */
export type LoadingConfig = {
  url?: string;
};

/**
 * 组件用 url 请求 config props
 */
const withLoadingConfig: <T>() => HOC_Inject<T> = () => (Component) => (props: any) => {
  const [data, setData] = useState<any>(undefined);
  const { request } = useContext(SchemaComponentContext);

  useEffect(() => {
    init();
  }, []);


  async function init() {
    setData(undefined);
    setData(await request(props.url, 'GET'));
  }

  return data ? <Component ref={props.forwardRef} {...data} {...props} /> : <Spin spinning />;
};

export default withLoadingConfig;
