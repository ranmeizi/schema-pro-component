import React, { useContext, useEffect, useState } from 'react';
import { Spin } from 'antd';
import { SchemaComponentContext } from '../components/Provider';

/** 获取 props 的 url */
export type LoadingConfig = {
  url?: string;
};

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

  return data ? <Component {...data} {...props} /> : <Spin spinning />;
};

export default withLoadingConfig;
