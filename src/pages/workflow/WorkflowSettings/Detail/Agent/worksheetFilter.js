import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { Modal, Select } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import flowNode from '../../../api/flowNode';
import worksheet from 'src/api/worksheet';
import { checkConditionsIsNull } from '../../utils';
import { TriggerCondition } from '../components';

const AddActionBtn = styled.div`
  span {
    display: inline-block;
    height: 32px;
    line-height: 32px;
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
    padding: 0 20px;
    background: var(--color-background-secondary);
    cursor: pointer;
    margin-right: 10px;
    box-sizing: border-box;
    &:not(:hover) {
      border-color: var(--color-border-primary) !important;
    }
  }
`;

const renderSelectLabel = (label, isDeleted) => (isDeleted ? <span className="textError">{_l('已删除')}</span> : label);

const WorksheetFilter = props => {
  const { companyId, relationId, processId, selectNodeId, nodeId, worksheetId, onOk, onClose } = props;
  const [viewId, setViewId] = useState(props.viewId || '');
  const [fields, setFields] = useState(props.fields || []);
  const [filters, setFilters] = useState(props.filter || []);
  const [filterControls, setFilterControls] = useState([]);
  const [views, setViews] = useState([]);
  const [fieldControls, setFieldControls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      flowNode.getAppTemplateControls({
        processId,
        nodeId: selectNodeId,
        appId: worksheetId,
        appType: 1,
      }),
      worksheet.getWorksheetInfo({
        worksheetId,
        getViews: true,
      }),
    ]).then(([controls, worksheetInfo]) => {
      setFilterControls(controls);
      setViews(worksheetInfo.resultCode === 1 ? worksheetInfo.views || [] : []);
      setFieldControls(worksheetInfo.resultCode === 1 ? worksheetInfo.template?.controls || [] : []);
      setLoading(false);
    });
  }, [processId, selectNodeId, worksheetId]);

  return (
    <Modal
      width={640}
      className="workflowDialogBox"
      open
      title={_l('设置')}
      onOk={() => {
        if (filters.length) {
          const hasError = filters.some(item => checkConditionsIsNull(item.conditions));

          if (hasError) {
            alert(_l('筛选条件的判断值不能为空'), 2);
            return;
          }
        }

        onOk({
          viewId,
          fields,
          filters,
        });
        onClose();
      }}
      onCancel={onClose}
    >
      {loading ? (
        <LoadDiv className="mTop15" />
      ) : (
        <Fragment>
          <div className="Font13 bold">{_l('指定视图')}</div>
          <Select
            className="w100 mTop10"
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder={_l('请选择视图')}
            value={viewId || undefined}
            options={views.map(view => ({
              label: view.name,
              value: view.viewId,
            }))}
            labelRender={({ label, value }) => renderSelectLabel(label, !views.some(view => view.viewId === value))}
            onChange={value => setViewId(value || '')}
          />

          <div className="Font13 bold mTop20">{_l('指定返回字段')}</div>
          <Select
            className="w100 mTop10"
            mode="multiple"
            allowClear
            showSearch
            optionFilterProp="label"
            maxTagCount="responsive"
            placeholder={_l('为空时返回全部字段')}
            value={fields}
            options={fieldControls.map(control => ({
              label: control.controlName,
              value: control.controlId,
            }))}
            labelRender={({ label, value }) =>
              renderSelectLabel(label, !fieldControls.some(control => control.controlId === value))
            }
            onChange={setFields}
          />

          <div className="Font13 bold mTop20">{_l('筛选条件')}</div>

          {filters.length ? (
            <TriggerCondition
              projectId={companyId}
              relationId={relationId}
              processId={processId}
              selectNodeId={nodeId}
              openNewFilter
              controls={filterControls}
              data={filters}
              updateSource={filters => setFilters(filters)}
              filterEncryptCondition
            />
          ) : (
            <AddActionBtn className="mTop15">
              <span className="borderColorPrimary" onClick={() => setFilters([{ conditions: [[{}]], spliceType: 2 }])}>
                <i className="icon-add Font16" />
                {_l('筛选条件')}
              </span>
            </AddActionBtn>
          )}
        </Fragment>
      )}
    </Modal>
  );
};

export function useWorksheetFilterDialog() {
  return useFunctionWrapComponent(WorksheetFilter);
}
