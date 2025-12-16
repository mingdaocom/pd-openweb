import React, { Fragment, useEffect, useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Dialog, Dropdown, FunctionWrap, LoadDiv, Support } from 'ming-ui';
import { getControlTypeName, getIcons } from '../../../utils';

const NoData = styled.div`
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const SelectToolsFields = props => {
  const { subFlowNodeApps = [], toolsFunction, onOk, onClose } = props;
  const [selectNodeId, setSelectNodeId] = useState('');
  const [selectControlId, setSelectControlId] = useState('');
  const [list, setList] = useState(null);
  const toolTitle = item => {
    return (
      <div className="flexRow alignItemsCenter">
        <span className={cx('Font16 Gray_9e', getIcons(item.nodeTypeId, item.appType, item.actionId))} />
        <span className="mLeft5">
          {item.nodeName}-{item.appName}
        </span>
      </div>
    );
  };
  const fieldTitle = (item, showType = true) => {
    return (
      <div className="flexRow alignItemsCenter">
        {showType && <span className="Gray_9e mRight5">[{getControlTypeName(item)}]</span>}
        <span>{item.controlName}</span>
      </div>
    );
  };
  const fieldList = selectNodeId && list ? list.find(o => o.nodeId === selectNodeId).controls : [];

  useEffect(() => {
    if (subFlowNodeApps.length) {
      setList(subFlowNodeApps);
      return;
    }

    toolsFunction().then(result => {
      setList(result);
    });
  }, []);

  return (
    <Dialog
      className="workflowDialogBox"
      width={640}
      visible
      title={_l('工具调用的工作表字段')}
      onOk={() => {
        if (!selectNodeId) {
          alert(_l('请选择工具'), 2);
          return;
        }

        if (!selectControlId) {
          alert(_l('请选择字段'), 2);
          return;
        }

        const node = list.find(o => o.nodeId === selectNodeId);
        const control = node.controls.find(o => o.controlId === selectControlId);

        onOk({
          nodeId: node.nodeId,
          fieldValueId: control.controlId,
          nodeName: node.nodeName,
          fieldValueName: control.controlName,
          fieldValueType: control.type,
          nodeTypeId: node.nodeTypeId,
          appType: node.appType,
          actionId: node.actionId,
          isSourceApp: node.isSourceApp,
          nAlias: node.alias,
          cAlias: control.alias,
          sourceType: control.sourceType,
        });
        onClose();
      }}
      onCancel={onClose}
      {...(list && !list.length && { footer: null })}
    >
      {list === null && <LoadDiv />}
      {list && !list.length && (
        <NoData>
          <div className="Font17 Gray_75">{_l('当前暂无可引用的字段')}</div>
          <div className="flexRow alignItemsCenter mTop5 Gray_9e">
            {_l('请前往目标节点配置后再试')}
            <Support
              className="mLeft3"
              type={3}
              href="https://help.mingdao.com/workflow/node-ai-agent"
              text={_l('查看配置说明')}
            />
          </div>
        </NoData>
      )}
      {list && !!list.length && (
        <Fragment>
          <div className="bold">{_l('AI Agent工具')}</div>
          <Dropdown
            className="w100 mTop10"
            menuClass="w100"
            data={list.map(o => {
              return {
                text: toolTitle(o),
                value: o.nodeId,
              };
            })}
            value={selectNodeId || undefined}
            placeholder={_l('选择工具')}
            border
            renderTitle={() => selectNodeId && toolTitle(list.find(o => o.nodeId === selectNodeId))}
            onChange={nodeId => setSelectNodeId(nodeId)}
          />

          <div className="mTop20 bold">{_l('字段')}</div>
          <Dropdown
            className="w100 mTop10"
            menuClass="w100"
            disabled={!selectNodeId}
            data={fieldList.map(o => {
              return {
                text: fieldTitle(o),
                value: o.controlId,
              };
            })}
            value={selectControlId || undefined}
            placeholder={_l('选择字段')}
            border
            renderTitle={() =>
              selectControlId &&
              fieldTitle(
                fieldList.find(o => o.controlId === selectControlId),
                false,
              )
            }
            onChange={controlId => setSelectControlId(controlId)}
          />
        </Fragment>
      )}
    </Dialog>
  );
};

export default props => FunctionWrap(SelectToolsFields, { ...props });
