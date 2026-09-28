import React, { Fragment } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { Modal, Select } from 'ming-ui/antd-components';

const renderCallbackNodeLabel = (nodes, value) => {
  const currentNode = _.find(nodes, node => Object.keys(node)[0] === value);

  return currentNode ? currentNode[value] : <span className="errorColor">{_l('节点已删除')}</span>;
};

export default ({ data, getCallBackNodeNames, updateSource, onClose }) => {
  const [callbackOptions, setCallbackOptions] = useSetState({
    callBackNodeType: data.callBackNodeType,
    callBackType: data.callBackType === 1 && data.callBackMultipleLevel === 1 ? 2 : data.callBackType,
    callBackMultipleLevel: data.callBackMultipleLevel,
    callBackNodeIds: data.callBackNodeIds,
  });
  const CALL_BACK = [
    { label: _l('重新执行流程'), value: 0 },
    { label: data.multipleLevelType === 0 ? _l('直接返回审批节点') : _l('返回此节点的第一级'), value: 1 },
    { label: _l('直接返回退回的层级'), value: 2 },
  ];
  const CALLBACK_NODE_TYPE = [
    { label: _l('上方所有节点'), value: 0 },
    { label: _l('指定节点'), value: 3 },
    { label: _l('仅上一个节点'), value: 2 },
    { label: _l('仅发起节点'), value: 1 },
  ];

  if (data.multipleLevelType === 0) {
    _.remove(CALL_BACK, o => o.value === 2);
  }

  return (
    <Modal
      open
      width={640}
      className="workflowDialogBox workflowSettings"
      mask={{ closable: false }}
      title={_l('退回设置')}
      onOk={() => {
        if (callbackOptions.callBackNodeType === 3 && !callbackOptions.callBackNodeIds.length) {
          alert(_l('必须指定节点'), 2);
          return;
        }

        updateSource({
          callBackType: callbackOptions.callBackType === 2 ? 1 : callbackOptions.callBackType,
          callBackMultipleLevel: callbackOptions.callBackType === 2 ? 1 : -1,
          callBackNodeType: callbackOptions.callBackNodeType,
          callBackNodeIds: callbackOptions.callBackNodeIds,
        });
        onClose();
      }}
      onCancel={onClose}
    >
      <div className="bold">{_l('可退回到的节点')}</div>
      <Select
        className="mTop10 w100"
        options={CALLBACK_NODE_TYPE}
        value={callbackOptions.callBackNodeType}
        onChange={type => {
          setCallbackOptions({ callBackNodeType: type, callBackType: type === 2 ? 1 : callbackOptions.callBackType });

          if (data.selectNodeId && type === 3 && !data.callBackNodes.length) {
            getCallBackNodeNames(data.selectNodeId, callbackOptions.callBackType);
          }
        }}
      />

      {callbackOptions.callBackNodeType === 0 && (
        <div
          className="mTop10 flexRow alignItemsCenter boderRadAll_4 pLeft12 pRight12 textSecondary"
          style={{ minHeight: 36, background: 'var(--color-background-disabled)' }}
        >
          {data.callBackNodes.map(o => Object.values(o)).join('、') || _l('无可退回的节点')}
        </div>
      )}

      {callbackOptions.callBackNodeType === 3 && (
        <div className="flowDetailTrigger">
          <Select
            className="mTop10 w100 flowDropdown flowDropdownMoreSelect"
            mode="multiple"
            options={data.callBackNodes.map(o => {
              return {
                label: Object.values(o)[0],
                value: Object.keys(o)[0],
              };
            })}
            value={callbackOptions.callBackNodeIds}
            placeholder={_l('请选择')}
            labelRender={({ value }) => renderCallbackNodeLabel(data.callBackNodes, value)}
            onChange={callBackNodeIds => setCallbackOptions({ callBackNodeIds })}
          />
        </div>
      )}

      {callbackOptions.callBackNodeType !== 2 && (
        <Fragment>
          <div className="bold mTop20">{_l('被退回的节点重新提交时')}</div>
          <Select
            className="mTop10 w100"
            options={CALL_BACK}
            value={
              callbackOptions.callBackType === 1 && callbackOptions.callBackMultipleLevel === 1
                ? 2
                : callbackOptions.callBackType
            }
            onChange={type => {
              setCallbackOptions({
                callBackType: type,
                callBackMultipleLevel: type === 2 ? 1 : -1,
                callBackNodeIds: [],
              });

              if (data.selectNodeId) {
                getCallBackNodeNames(data.selectNodeId, type === 2 ? 1 : type);
              }
            }}
          />
        </Fragment>
      )}
    </Modal>
  );
};
