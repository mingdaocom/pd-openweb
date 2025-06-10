import React, { Fragment } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { Dialog, Dropdown, Icon } from 'ming-ui';

export default ({ data, getCallBackNodeNames, updateSource, onClose }) => {
  const [callbackOptions, setCallbackOptions] = useSetState({
    callBackNodeType: data.callBackNodeType,
    callBackType: data.callBackType === 1 && data.callBackMultipleLevel === 1 ? 2 : data.callBackType,
    callBackMultipleLevel: data.callBackMultipleLevel,
    callBackNodeIds: data.callBackNodeIds,
  });
  const CALL_BACK = [
    { text: _l('重新执行流程'), value: 0 },
    { text: data.multipleLevelType === 0 ? _l('直接返回审批节点') : _l('返回此节点的第一级'), value: 1 },
    { text: _l('直接返回退回的层级'), value: 2 },
  ];
  const CALLBACK_NODE_TYPE = [
    { text: _l('上方所有节点'), value: 0 },
    { text: _l('指定节点'), value: 3 },
    { text: _l('仅上一个节点'), value: 2 },
    { text: _l('仅发起节点'), value: 1 },
  ];

  if (data.multipleLevelType === 0) {
    _.remove(CALL_BACK, o => o.value === 2);
  }

  return (
    <Dialog
      visible
      width={640}
      className="workflowDialogBox workflowSettings"
      style={{ overflow: 'initial' }}
      overlayClosable={false}
      type="scroll"
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
      <Dropdown
        className="mTop10 w100"
        border
        menuStyle={{ width: '100%' }}
        data={CALLBACK_NODE_TYPE}
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
          className="mTop10 flexRow alignItemsCenter boderRadAll_4 pLeft12 pRight12 Gray_75"
          style={{ minHeight: 36, background: '#F4F4F4' }}
        >
          {data.callBackNodes.map(o => Object.values(o)).join('、') || _l('无可退回的节点')}
        </div>
      )}

      {callbackOptions.callBackNodeType === 3 && (
        <div className="flowDetailTrigger">
          <Dropdown
            className="mTop10 w100 flowDropdown flowDropdownTags"
            border
            menuStyle={{ width: '100%' }}
            data={data.callBackNodes.map(o => {
              return {
                text: Object.values(o),
                value: Object.keys(o)[0],
                disabled: _.includes(callbackOptions.callBackNodeIds, Object.keys(o)[0]),
              };
            })}
            value=""
            onChange={nodeId => {
              const callBackNodeIds = callbackOptions.callBackNodeIds;

              if (_.includes(callBackNodeIds, nodeId)) {
                _.remove(callBackNodeIds, o => o === nodeId);
              } else {
                callBackNodeIds.push(nodeId);
              }

              setCallbackOptions({ callBackNodeIds });
            }}
            renderTitle={() => {
              return (
                <div className="flex triggerConditionNum triggerConditionDropdown">
                  {!callbackOptions.callBackNodeIds.length ? (
                    <div className="Gray_bd pLeft10 pRight10">{_l('请选择')}</div>
                  ) : (
                    <ul className="pLeft6 tagWrap">
                      {callbackOptions.callBackNodeIds.map((key, index) => {
                        const currentNode = _.find(data.callBackNodes, o => Object.keys(o)[0] === key);

                        return (
                          <li key={index} className="tagItem flexRow">
                            <span className="tag">
                              {currentNode ? (
                                currentNode[key]
                              ) : (
                                <span style={{ color: '#f44336' }}>{_l('节点已删除')}</span>
                              )}
                            </span>
                            <span
                              className="delTag"
                              onClick={e => {
                                e.stopPropagation();

                                setCallbackOptions({
                                  callBackNodeIds: callbackOptions.callBackNodeIds.filter(id => id !== key),
                                });
                              }}
                            >
                              <Icon icon="close" className="pointer" />
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            }}
          />
        </div>
      )}

      {callbackOptions.callBackNodeType !== 2 && (
        <Fragment>
          <div className="bold mTop20">{_l('被退回的节点重新提交时')}</div>
          <Dropdown
            className="mTop10 w100"
            border
            menuStyle={{ width: '100%' }}
            data={CALL_BACK}
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
    </Dialog>
  );
};
