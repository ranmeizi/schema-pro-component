# SchemaComponent

起因是，要写出一套可用于 react 项目 与 Grafana App/Panel plugin 可用的 SchemaTable 组件。

主要是方便 Grafana 使用，尽量的在代码中减少 props 依赖项，而是转为吧这些依赖变成后端返回的json props

让后端用 schema 去描述页面

>虽然理论上 pro 的 column schema 配合ProComponent 描述能力很强,我相信也能够构建出满足产品需求的页面  
但这个方式确实 **不适用** 于很复杂的页面设计，这将会产生 **大量的 不好维护的 schema json** 以及 **不易读的 不连续的逻辑代码** ,在没有友好的 json 编辑器的情况下开发体验极差 
使用前先尝试，过过脑子再决定使用在项目上

## json 编辑器

并没有 json 编辑器，但本项目会严格书写 ts 类型，用 vsc typescript 语法插件 搭配 antd 的 d.ts 让你在编辑器里有对应 json 属性的功能提示以及文档跳转，稍微提升一下开发体验

## 依赖项

因为这是一个 component 模块，所以尽量适用于各个环境比较好，我要求一些外部依赖即 peerDependencies

### IRequest  

这是一个请求函数的接口，不管你是用 umi request / axios / feach，你需要实现这个request接口，让我的 action url 请求到数据

### IProProvider

这是提供给 pro-provider 的 props 值，他可以给深层的组件提供配置参数。

目前使用的 valueTypeMap 可以饮用自己的组件完成更加自定义的页面。

## 使用方法

1. Provider 组件，保证他在 schema component 的外层(最好是 router 更上一级的外层，保证他唯一)

2. RemoteSchemaEditableProTable 组件(Components) , 给他们提供对应的 props 值

```tsx
import {Provider,RemoteSchemaEditableProTable} from '@bomon/schema-pro-component'
import {Input} from 'antd'

function request(url:string,method,params:any){
    // 自己适配 request 这里只是例子
    return fetch(url,{method:'POST',body:JSON.stringify(params)})
}

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
