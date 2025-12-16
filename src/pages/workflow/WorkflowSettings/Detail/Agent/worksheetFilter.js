import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Dialog, FunctionWrap, LoadDiv } from 'ming-ui';
import flowNode from '../../../api/flowNode';
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
    background: #f5f5f5;
    cursor: pointer;
    margin-right: 10px;
    box-sizing: border-box;
    &:not(:hover) {
      border-color: #ddd !important;
    }
  }
`;

const WorksheetFilter = props => {
  const { onOk, onClose } = props;
  const [filters, setFilters] = useState(props.filter || []);
  const [controls, setControls] = useState([]);

  useEffect(() => {
    flowNode
      .getAppTemplateControls({
        processId: props.processId,
        nodeId: props.selectNodeId,
        appId: props.worksheetId,
        appType: 1,
      })
      .then(res => setControls(res));
  }, []);

  return (
    <Dialog
      width={640}
      className="workflowDialogBox"
      visible
      title={_l('设置')}
      onOk={() => {
        if (filters.length) {
          let hasError = false;

          filters.forEach(item => {
            if (checkConditionsIsNull(item.conditions)) {
              hasError = true;
            }
          });

          if (hasError) {
            alert(_l('筛选条件的判断值不能为空'), 2);
            return;
          }

          onOk(filters);
          onClose();
        } else {
          onOk([]);
          onClose();
        }
      }}
      onCancel={onClose}
    >
      <div className="Font13 bold">{_l('查询范围')}</div>
      <div className="Font13 Gray_75 mTop5">{_l('定义模型的查询范围，未配置时默认查询工作表的全部数据')}</div>

      {!controls.length ? (
        <LoadDiv className="mTop15" />
      ) : (
        <Fragment>
          {filters.length ? (
            <TriggerCondition
              projectId={props.companyId}
              relationId={props.relationId}
              processId={props.processId}
              selectNodeId={props.nodeId}
              openNewFilter
              controls={controls}
              data={filters}
              updateSource={filters => setFilters(filters)}
              filterEncryptCondition
            />
          ) : (
            <AddActionBtn className="mTop15">
              <span className="ThemeBorderColor3" onClick={() => setFilters([{ conditions: [[{}]], spliceType: 2 }])}>
                <i className="icon-add Font16" />
                {_l('筛选条件')}
              </span>
            </AddActionBtn>
          )}
        </Fragment>
      )}
    </Dialog>
  );
};

export default props => FunctionWrap(WorksheetFilter, { ...props });
