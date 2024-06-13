import type { Request } from '../components/Provider';

// 自己控制 override 什么时候执行

export function overrideRequest(columns: any[], request: Request) {
  for (const col of columns) {
    if (typeof col.request === 'string') {
      const url = col.request;
      col.request = async function (params: any) {
        return await request(url, 'GET', params);
      };
    }
  }
}
