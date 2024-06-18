# SchemaComponent

一套基于 pro-components 开发的，使用 json schema 驱动的一套组件，目的是想使用 remote 的json配置文件远程加载配置文件到pro-components组件内.

所有组件都有 原始版(jsx props) 以及 Remote版(url json props)，方便各种场景使用

## 使用手册

### 安装

npm:

```npm install @bomon/schema-pro-component```

yarn:

```yarn add @bomon/schema-pro-component```

请注意版本

1 开头的版本是对应 pro-components v1 的，2 开头的版本是对应 pro-components v2 的，pro-components 对于configprovider的管理稍有不一样，需要按版本选择

如 ```npm install @bomon/schema-pro-component@~1```

### 使用方法

1. Provider 组件，保证他在 schema component 的外层(最好是 router 更上一级的外层，保证他唯一)

2. RemoteSchemaEditableProTable 组件(Components) , 给他们提供对应的 props 值

```tsx
import {Provider,RemoteSchemaEditableProTable} from '@bomon/schema-pro-component'
import {Input} from 'antd'

// 外部传入实现 IRequest 的请求函数
function request(url:string,method,params:any){
    // 自己适配 request 这里只是例子
    return fetch(url,{method:'POST',body:JSON.stringify(params)})
}

// 注入自定义的 form field
const valueTypeMap = {
    'my-input':{
        renderText(text){
            return text
        },
        renderFormItem(){
            return <Input/>
        }
    }
}

export default function(){
    return <Provider request={request} valueTypeMap={valueTypeMap}>
        <RemoteSchemaEditableProTable url='http://dev-cn.your-api-server.com/protable/config/props'/>
    </Provider>
}

```

#### Provider

Provider 用于给组件提供依赖项，例如组件内部使用的 request 函数，pro-form 使用的自定义 formfield。理论上他放在 schema-pro-component 上层就可以，不过一般在 router 上层统一注入统一的依赖。  

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| request | 给RemoteSchema组件执行请求操作的函数 | (url: string, method?: 'POST' \| 'GET', params?: any) => Promise\<any\>; |
| valueTypeMap | 直接透传给 ProConfigProvider | 同 ProConfigProvider 的 valueTypeMap |

#### SchemaEditableProTable

使用 schema 作为 props 的组件，是 RemoteSchemaEditableProTable 的基础，一般不单独使用。因为即然用到前端写代码了，就不用遵循这套标准了，直接用 pro-components 的 EditableProTable 不是更灵活么。

| 参数 | 说明 | 类型 | |
| --- | --- | --- | --- |
| editableProTableProps | 给pro-components EditableProTable 组件的props，只支持其中可序列化的部分。 Pro-Component 文档: [EditableProTable props](https://procomponents.ant.design/components/editable-table#editableprotable) \| [Columns](https://procomponents.ant.design/components/table#columns-%E5%88%97%E5%AE%9A%E4%B9%89) | {editableProTableProps:EditableProTableProps,actions:\{queryList:srting,create:string,updateById:string,deleteById:string\}} | 必须 |
| actions | 对应请求地址 | - | 必须 |
| vars | 外部参数，当vars发生改变时，将会刷新表格数据 | Record<string,any> | 可选 |
| mergedParams | 一个数组，如果写了 vars 的key 值，该值将会在 request 时被携带 | string[] | 可选 |
| overrideActions | 覆盖内部请求行为 | Partial<ActionFns> |

#### RemoteSchemaEditableProTable

| 参数 | 说明 | 类型 | |
| --- | --- | --- | --- |
| url | 用于请求 SchemaEditableProTable 的 editableProTableProps 和 actions 数据，初始化时会向[editableprotableconfig](#1editableprotableconfigget) 发起一个请求 | Record<string,any> | 可选 |

mergedParams?: MergedParamsConfig;
  vars?: Record<string, any>;
  overrideActions?: Partial<ActionFns>;

### 核心接口规范

本组件大概率会是实现表的 增删改查，这里定义规范。

TODO: 使用 request 自己处理不同的通用响应的json类型。(但现在内部使用，不会兼容别的类型)

#### CommonRes

CommonRes 随意，你可以在 request 时自己处理

```ts
type CommonRes<T> = {
    code:string
    msg:string
    result:T
}
```

json
```
{
    "code":"000000",
    "msg":"success",
    "result":...
}
```

**⬇下面讨论的所有类型说明，都是正确流程的CommonRes.result**

#### 用于 RemoteSchemaEditableProTable 的 schema json

远程加载 json 配置的 可编辑表格

##### 1.editableProTableConfig[GET]

用与 SchemaEditableProTable url 请求的 props json 规范,且用于定义表结构。

命名规范 protocol//host:port/**/editableProTableConfig

**请求参数**

空

**响应体**

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| editableProTableProps | 给pro-components EditableProTable 组件的props，只支持其中可序列化的部分。 Pro-Component 文档: [EditableProTable props](https://procomponents.ant.design/components/editable-table#editableprotable) \| [Columns](https://procomponents.ant.design/components/table#columns-%E5%88%97%E5%AE%9A%E4%B9%89) | {editableProTableProps:EditableProTableProps,actions:\{queryList:srting,create:string,updateById:string,deleteById:string\}} |
| actions | 对应请求地址 | - |


**响应 json 示例**：

```json
{
    "code": "000000",
    "msg": "success",
    "result": {
        "editableProTableProps": {
            "rowKey": "key",
            "columns": [
                {
                    "title": "投顾机构",
                    "dataIndex": "advisor",
                    "valueType": "select",
                    "editable": true,
                    "formItemProps": {
                        "rules": [
                            {
                                "required": true,
                                "message": "不能为空"
                            }
                        ]
                    },
                    "params": {
                        "status": "actived"
                    },
                    "request": "/api/advisor/query/20240606"
                },
                {
                    "title": "投顾文件",
                    "dataIndex": "file_tag",
                    "editable": true,
                    "valueType": "SC_DependenciesOptionsSelect",
                    "params": {},
                    "formItemProps": {
                        "rules": [
                            {
                                "required": true,
                                "message": "不能为空"
                            }
                        ]
                    },
                    "dependencies": [
                        "advisor"
                    ],
                    "request": "/api/advisor/file/query/20240606"
                },
                {
                    "title": "上报类型",
                    "dataIndex": "send_type",
                    "valueType": "SC_DependenciesOptionsSelect",
                    "params": {},
                    "editable": true,
                    "valueEnum": {
                        "S": "签约",
                        "U": "解约",
                        "0T1": "修改为建议型投顾",
                        "1T0": "修改为管理行投顾"
                    },
                    "dependencies": [
                        "file_tag"
                    ],
                    "request": "/api/advisor/query/send_type/20240606"
                },
                {
                    "title": "上报值",
                    "dataIndex": "unique_key",
                    "formItemProps": {
                        "rules": [
                            {
                                "required": true,
                                "message": "不能为空"
                            }
                        ]
                    },
                    "editable": true
                }
            ],
            "style": {
                "height": "100%"
            },
            "cardProps": {
                "style": {
                    "height": "calc(100% - 80px)"
                }
            }
        },
        "actions": {
            "queryList": "/api/advisor/query/force_send/20240606",
            "create": "/api/advisor/save/force_send/20240606",
            "updateById": "/api/advisor/save/force_send/20240606",
            "deleteById": "/api/advisor/save/force_send/20240606"
        }
    }
}
```

**定义表结构的字段**

editableProTableProps.rowKey: 抽象出的表的唯一键，为了保证行的唯一性，不管你是单主键还是联合主键，都需要给前端提供唯一的rowKey。在 update / delete 的时候，rowKey 值将会被回传。

editableProTableProps.columns[].dataIndex: 这是用于定义表的列结构，所有在 columns 中写的 dataIndex，都会在 create / update 时，按照你定义dataIndex的名称回传他们的值。

**功能性字段**

editableProTableProps.columns[].title: 列的显示名称。

editableProTableProps.columns[].valueType: 列编辑控件的类型 详见[valueType](https://procomponents.ant.design/components/schema#valuetype)

editableProTableProps.columns[].editable: 列是否可编辑。

editableProTableProps.columns[].params: 随着 request 发送的数据。

editableProTableProps.columns[].dependencies: 依赖项，当依赖项的值改变时，会带着依赖项的值去触发 request 函数，向 request 的地址发起一个请求。

editableProTableProps.columns[].request: 下拉列表数据请求的地址。

##### 2.queryList[GET]

列表请求接口，用于 初始化/刷新 的数据更新

命名规范 protocol//host:port/**/queryList

**请求参数**

| 参数 | 说明 | 类型 |  |
| --- | --- | --- | --- |
| pageSize | 每页行数 | number | 可选 |
| pageNum | 第几页 | number | 可选 |
| sort | 排序参数 TODO | {[[dataIndex]](#dataindex):'ascend'\|'descend'} | 可选 |
| filter | 筛选参数 TODO |{[[dataIndex]](#dataindex):string[]} | 可选 |
| [[dataIndex]](#dataindex) | 搜索查询参数 | string | 可选 |

**请求json示例**

```json
{
  "pageSize": 1,
  "pageNum": 20,
  "sort": {
    "status": "ascend"
  },
  "filter": {
    "status": [
      "1",
      "2"
    ]
  },
  "type": "1"
}
```


**响应体**

| 参数 | 说明 | 类型 |  |
| --- | --- | --- | --- |
| data | 列表数据 | any[] | 必须 |
| success | 查询结果 | boolean | 必须 |
| total | 总条数 | number | 必须 |

**响应 json 示例**：

```json
{
  "code": "000000",
  "msg": "success",
  "result": {
    "data": [
      {
        "key": "JS-201-S",
        "advisor": "JS",
        "file_tag": "201",
        "send_type": "S",
        "unique_key": "1"
      }
    ],
    "total": 41
  }
}
```

##### 3.create[POST]

用于创建一行数据

命名规范 protocol//host:port/**/create

**请求参数**

| 参数 | 说明 | 类型 |  |
| --- | --- | --- | --- |
| [[dataIndex]](#dataindex) | 搜索查询参数 | string | - |

**请求json示例**

```json
{
  "date": "2024-05-28",
  "advisor": "JS",
  "file_tag": "201",
  "send_type": "S",
  "unique_key": "1",
  "index": 0
}
```

**响应体**

空

**响应 json 示例**：

```json
{
  "code": "000000",
  "msg": "success",
  "result": null
}
```

##### 4.updateById[POST]

用于更新一行数据，除了数据，rowKey 值将会随着请求被发送

命名规范 protocol//host:port/**/updateById

**请求参数**

| 参数 | 说明 | 类型 |  |
| --- | --- | --- | --- |
| [rowKey] | - | - | 必须 |
| [[dataIndex]](#dataindex) | 搜索查询参数 | string | - |

**请求json示例**

```json
{
  "date": "2024-05-28",
  "key": "JS-201-S",
  "advisor": "JS",
  "file_tag": "201",
  "send_type": "S",
  "unique_key": "1",
  "index": 0
}
```

##### 5.deleteById[POST]

使用 rowKey 删除行

命名规范 protocol//host:port/**/deleteById

**请求参数**

| 参数 | 说明 | 类型 |  |
| --- | --- | --- | --- |
| [rowKey] | - | - | 必须 |

**请求json示例**

```json
{
  "key": "JS-201-S",
}
```

**响应体**

空

**响应 json 示例**：

```json
{
  "code": "000000",
  "msg": "success",
  "result": null
}
```

##### 下拉列表请求

用于 editableProTableConfig.columns[].request 的请求，将会在表格 初始化/params变化 时发起请求。


**请求参数**

| 参数 | 说明 | 类型 |  |
| --- | --- | --- | --- |
| [dataIndex] | - | - | 可选 |

**请求json示例**

```json
{
  "field1": "JS-201-S",
}
```


**响应体**

响应体需要符合 antd 规范 [request](https://procomponents.ant.design/components/schema#request-%E5%92%8C-params)

**响应 json 示例**：

```json
{
  "code": "000000",
  "msg": "success",
  "result": [
    {"label":"选项1","value":1},
    {"label":"选项2","value":2}
  ]
}
```



### dataIndex

> [dataIndex]说的是你在 [1.editableProTableConfig](#1editableprotableconfig) editableProTableProps.columns[].dataindex 里表的列结构中定义的 dataIndex 名称

## 后续优化方向

### 1.playground

提供一个 [codesandbox](https://codesandbox.io/p/sandbox/schema-playground-tz2pq3?file=%2Fsrc%2Findex.tsx%3A11%2C32) 让你可以在线写 schema json，并在右边展示出组件运行出的样子。

### 2.简化 config

这还是设想，但大概想了2个方向

#### 简化板组件

抛弃antd标准，自定义一个更简洁的 config ，开发速度提升⬆️，相应的组件功能减少⬇️，学习的标准增加⬇️。(不太好)

#### Json 片段

即然代码可以复用，那么json也可以复用。使用vscode的code-snippets，将常用的json代码块保存起来。使用关键字，生成这段json片段

### 3.设计方向

因为最底层 ProComponent 功能强大，可以实现超多功能适应超多场景。所以设想底层组件需要基于ProComponent实大量功能，而并不是底层组件实现基础crud功能，这样会造成对 procomponent 的浪费。 上层组件去一级一级挑选，特异化成更简洁的组件。