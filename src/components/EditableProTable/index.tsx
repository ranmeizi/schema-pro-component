/* eslint-disable @typescript-eslint/no-unused-expressions */
import { EditableProTable, ProColumnType } from '@ant-design/pro-table';
import { FormInstance, Popconfirm } from 'antd';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import type { LoadingConfig } from '../../utils/withLoadingConfig';
import withLoadingConfig from '../../utils/withLoadingConfig';
import type { EditableProTableProps } from '@ant-design/pro-table/lib/components/EditableTable';
import { overrideRequest } from '../../overrides/columns';
import type { MergedParamsConfig, ActionFns } from '../../hooks/useRequestAgent';
import useRequestAgent, { useMergedParams, useTableAction } from '../../hooks/useRequestAgent';
import { useAgent } from '../../hooks/useAgent';
import { useCustomDependenciesColumns } from '../../utils/custom_dependencies';
import { TableProvider } from '../TableProvider';
import { ProForm } from '@ant-design/pro-components';
import useRefState from '../../hooks/useRefState';
import useFullTableScroll from 'hooks/useFullTableScroll';
import './style.less'

export type RemoteSchemaEditableProTableConfig = {
  editableProTableProps: EditableProTableProps<any, any>;
  actions: {
    queryList?: string;
    create?: string;
    updateById?: string;
    deleteById?: string;
  };
};

type SchemaEditableProTableProps = {
  /** 透传的 ref。 */
  forwardRef?: any;
  /** 随请求携带的 vars key。 */
  mergedParams?: MergedParamsConfig;
  /** 外部变量，当vars变化时，重新获取数据。*/
  vars?: Record<string, any>;
  /** 重写内部请求的行为。 */
  overrideActions?: Partial<ActionFns>;
} & LoadingConfig &
  RemoteSchemaEditableProTableConfig;

export type SchemaEditableProTableRefType = {
  /** 获取表格数据 */
  getDataSource(): any[]
  getColumns: () => ProColumnType<any>[]
  form: FormInstance
}

// 新增 rowkey 前缀 
const PREFIX_ROWKEY = '__front_addnew__';

const SchemaEditableProTable = forwardRef(function (props: SchemaEditableProTableProps, ref: any) {
  // 提取需要合并的公共参数
  const commonParams = useMergedParams({ vars: props.vars || {} }, props.mergedParams);
  // 请求函数
  const request = useRequestAgent({ commonParams });

  const [columns, setColumns, refColumns] = useRefState<any[]>([]);
  const [value, setValue] = useState<any[]>([]);
  const [form] = ProForm.useForm()

  // 处理 ref
  useImperativeHandle<any, SchemaEditableProTableRefType>(ref, () => {
    return {
      getDataSource: () => value,
      getColumns: () => refColumns.current || [],
      form: form
    }
  })

  const rowKey = props.editableProTableProps.rowKey as string;
  const vars = props.vars;

  // 自己给自定义组件实现 dependencies 的响应
  const [fix_columns, reset] = useCustomDependenciesColumns(columns);

  // 请求行为
  const actions = useTableAction(
    { request, actions: props.actions, rowKey },
    props.overrideActions,
  );

  useEffect(() => {
    init();
  }, []);

  // 刷新表格
  const refresh = useAgent(
    () => () => {
      setValue([]);
      actions.queryList(vars).then((res) => setValue(res?.data || []));
    },
    [vars],
  );

  useEffect(() => {
    // 获取数据
    refresh();
  }, [vars]);

  function init() {
    if (props?.editableProTableProps?.columns) {
      // 重写 request string => function
      overrideRequest(props.editableProTableProps.columns, request);

      // strict mode
      if (props.editableProTableProps.columns.some(item => item.valueType === 'option')) {
        return
      }

      // 加上操作列
      props.editableProTableProps.columns.push({
        title: '操作',
        valueType: 'option',
        render(_, record, index, action) {
          const optionList = [];
          if (props.actions.updateById) {
            optionList.push(
              <a
                key="editable"
                onClick={() => {
                  action?.startEditable?.(record[rowKey]);
                  //
                  reset(record);
                }}
              >
                编辑
              </a>,
            );
          }
          if (props.actions.deleteById) {
            optionList.push(
              <Popconfirm
                title="确认要删除吗？"
                onConfirm={() => {
                  actions.deleteById({ [rowKey]: record[rowKey] }, record, form).then(refresh);
                }}
              >
                <a key="delete">删除</a>
              </Popconfirm>,
            );
          }
          return optionList;
        },
      });
    }

    setColumns(props.editableProTableProps.columns || []);
  }

  // 点击新增滚动
  function onCreate() {
    const el = document.querySelector(".schema-editable-protable .ant-table-body");
    el?.scrollTo({ top: el.scrollHeight });
    setTimeout(() => {
      el?.scrollBy({ top: 90 });
    }, 150);
  }

  const editableProTableProps = props.editableProTableProps || {};

  return (
    <TableProvider>
      <EditableProTable
        {...editableProTableProps}
        className="schema-editable-protable"
        columns={fix_columns as any}
        value={value || []}
        onChange={setValue as any}
        scroll={useFullTableScroll('.schema-editable-protable>.ant-pro-card')}
        editable={{
          type: 'single',
          form,
          async onSave(key, record) {
            // 更新数据
            if (String(record[rowKey]).startsWith(PREFIX_ROWKEY)) {
              delete record[rowKey];
              await actions.create(record, record, form);
            } else {
              await actions.updateById(record, record, form);
            }

            refresh();
          },
          actionRender: (row, config, defaultDom) => [defaultDom.save, defaultDom.cancel],
        }}
        recordCreatorProps={
          props.actions.create
            ? {
              onClick: onCreate,
              // 每次新增的时候需要Key
              record: () => ({ [rowKey]: PREFIX_ROWKEY + Date.now() }),
              creatorButtonText: '新建',
            }
            : false
        }
      />
    </TableProvider>
  );
})

const RemoteSchemaEditableProTable =
  withLoadingConfig<RemoteSchemaEditableProTableConfig>()(SchemaEditableProTable);

export { RemoteSchemaEditableProTable, SchemaEditableProTable };
