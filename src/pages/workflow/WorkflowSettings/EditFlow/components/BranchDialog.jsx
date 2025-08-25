import React, { useState } from 'react';
import _ from 'lodash';
import { Dialog, Radio } from 'ming-ui';
import { ACTION_ID, NODE_TYPE } from '../../enum';

export default ({
  nodeId,
  flowNodeMap,
  isLast,
  isConditionalBranch = false,
  onSave = () => {},
  onClose = () => {},
}) => {
  const [isSpecialBranch, setIsSpecialBranch] = useState(isConditionalBranch);
  const [isOrdinary, setIsOrdinary] = useState(true);
  const [moveType, setMoveType] = useState(1);
  const { typeId, actionId } = flowNodeMap[nodeId] || {};
  const MOVE_TYPE = () => {
    if (isOrdinary) {
      return [
        { text: _l('左侧'), value: 1 },
        { text: _l('不移动'), value: 0 },
      ];
    }

    if (typeId === NODE_TYPE.APPROVAL) {
      return [
        { text: _l('左侧（通过分支）'), value: 1 },
        { text: _l('右侧（否决分支）'), value: 2 },
        { text: _l('不移动'), value: 0 },
      ];
    }

    if (
      _.includes([NODE_TYPE.SEARCH, NODE_TYPE.FIND_SINGLE_MESSAGE, NODE_TYPE.GET_MORE_RECORD], typeId) ||
      (typeId === NODE_TYPE.ACTION && actionId === ACTION_ID.RELATION)
    ) {
      return [
        { text: _l('左侧（有数据分支）'), value: 1 },
        { text: _l('右侧（无数据分支）'), value: 2 },
        { text: _l('不移动'), value: 0 },
      ];
    }
  };

  // 结果分支
  if (isSpecialBranch) {
    return (
      <Dialog
        visible
        width={560}
        title={
          typeId === NODE_TYPE.APPROVAL
            ? _l('在审批节点下添加分支有两种选择：')
            : _l('在查找指定数据节点下添加分支有两种选择：')
        }
        onCancel={onClose}
        onOk={
          isLast || (flowNodeMap[(flowNodeMap[nodeId] || {}).nextId] || {}).actionId === ACTION_ID.PBC_OUT
            ? () => {
                onSave({ isOrdinary, moveType: 0 });
                onClose();
              }
            : () => setIsSpecialBranch(false)
        }
      >
        <Radio className="Font15" text={_l('添加普通分支')} checked={isOrdinary} onClick={() => setIsOrdinary(true)} />
        <div className="Gray_75 Font13 pLeft30 mTop5 mBottom15">
          {typeId === NODE_TYPE.APPROVAL
            ? _l('只对“通过”审批的数据进行分支处理')
            : _l('对查找到的数据进行分支处理。未查找到数据时，流程中止')}
        </div>
        <Radio
          className="Font15"
          text={typeId === NODE_TYPE.APPROVAL ? _l('添加审批结果分支') : _l('添加查找结果分支')}
          checked={!isOrdinary}
          onClick={() => setIsOrdinary(false)}
        />
        <div className="Gray_75 Font13 pLeft30 mTop5">
          {typeId === NODE_TYPE.APPROVAL
            ? _l('分支固定为“通过”和“否决”。如果你同时需要对“否决”审批的数据进行处理时选择此分支')
            : _l(
                '分支固定为“查找到数据”和“未查找到数据”。如果你需要在“未查找到”数据的情况下继续执行流程，请选择此分支',
              )}
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      visible
      width={560}
      title={_l('分支下方的节点整体放置在')}
      onCancel={onClose}
      onOk={() => {
        onSave({ isOrdinary, moveType });
        onClose();
      }}
    >
      {MOVE_TYPE().map(o => (
        <div key={o.value} className="mBottom15">
          <Radio className="Font15" text={o.text} checked={moveType === o.value} onClick={() => setMoveType(o.value)} />
        </div>
      ))}
      <div className="Gray_75 Font13 pLeft30" style={{ marginTop: -10 }}>
        {_l('等待分支汇集后再执行下方节点')}
      </div>
    </Dialog>
  );
};
