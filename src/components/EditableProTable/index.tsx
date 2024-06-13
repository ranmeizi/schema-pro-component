/* eslint-disable @typescript-eslint/no-unused-expressions */
import { EditableProTable } from '@ant-design/pro-table';
import { Popconfirm } from 'antd';
import React, { useEffect, useState } from 'react';
import type { LoadingConfig } from '../../utils/withLoadingConfig';
import withLoadingConfig from '../../utils/withLoadingConfig';
import type { EditableProTableProps } from '@ant-design/pro-table/lib/components/EditableTable';
import { overrideRequest } from '../../overrides/columns';
import type { MergedParamsConfig, ActionFns } from '../../hooks/useRequestAgent';
import useRequestAgent, { useMergedParams, useTableAction } from '../../hooks/useRequestAgent';
import { useAgent } from '../../hooks/useAgent';
import { useCustomDependenciesColumns } from '../../utils/custom_dependencies';

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
  mergedParams?: MergedParamsConfig;
  vars?: Record<string, any>;
  overrideActions?: Partial<ActionFns>;
} & LoadingConfig &
  RemoteSchemaEditableProTableConfig;

const PREFIX_ROWKEY = '__front_addnew__';

function SchemaEditableProTable(props: SchemaEditableProTableProps) {
  // 提取需要合并的公共参数
  const commonParams = useMergedParams({ vars: props.vars || {} }, props.mergedParams);
  // 请求函数
  const request = useRequestAgent({ commonParams });

  const [columns, setColumns] = useState<any[]>([]);
  const [value, setValue] = useState<any[]>([]);

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
                  actions.deleteById({ [rowKey]: record[rowKey] }, record).then(refresh);
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

  const editableProTableProps = props.editableProTableProps || {};

  return (
    <EditableProTable
      {...editableProTableProps}
      tableClassName="schema-editable-protable"
      columns={fix_columns as any}
      value={value || []}
      onChange={setValue}
      editable={{
        type: 'single',
        async onSave(key, record) {
          // 更新数据
          if (String(record[rowKey]).startsWith(PREFIX_ROWKEY)) {
            delete record[rowKey];
            await actions.create(record, record);
          } else {
            await actions.updateById(record, record);
          }

          refresh();
        },
        actionRender: (row, config, defaultDom) => [defaultDom.save, defaultDom.cancel],
      }}
      recordCreatorProps={
        props.actions.create
          ? {
              // 每次新增的时候需要Key
              record: () => ({ [rowKey]: PREFIX_ROWKEY + Date.now() }),
              creatorButtonText: '新建',
            }
          : false
      }
    />
  );
}

const RemoteSchemaEditableProTable =
  withLoadingConfig<RemoteSchemaEditableProTableConfig>()(SchemaEditableProTable);

export { RemoteSchemaEditableProTable, SchemaEditableProTable };
