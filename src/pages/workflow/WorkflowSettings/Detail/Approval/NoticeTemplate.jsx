import React, { useState } from 'react';
import { Dialog } from 'ming-ui';
import { CustomTextarea } from '../components';
import styled from 'styled-components';
import moment from 'moment';

const Preview = styled.div`
  box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.16);
  border-radius: 3px;
  padding: 16px 22px;
  .circle {
    width: 32px;
    height: 32px;
  }
`;

export default ({ companyId, processId, relationId, selectNodeId, data, selectMsgKey, updateSource, onClose }) => {
  const [selectMsg, setMsg] = useState(data[selectMsgKey]);
  const getNodeText = value => {
    const arr = value.match(/\$[^ \r\n]+?\$/g);

    if (arr) {
      arr.forEach(obj => {
        const ids = obj
          .replace(/\$/g, '')
          .split(/([a-zA-Z0-9#]{24,32})-/)
          .filter(item => item);

        value = value.replace(
          obj,
          `{${(data.formulaMap[ids[0]] || {}).name || ''}-${(data.formulaMap[ids.join('-')] || {}).name || ''}}`,
        );
      });
    }

    return value;
  };

  return (
    <Dialog
      visible
      width={640}
      className="workflowDialogBox workflowSettings"
      style={{ overflow: 'initial' }}
      overlayClosable={false}
      type="scroll"
      title={_l('通知设置')}
      onOk={() => {
        updateSource({ [selectMsgKey]: selectMsg.trim() });
        onClose();
      }}
      onCancel={onClose}
    >
      <div>{_l('消息内容')}</div>
      <CustomTextarea
        projectId={companyId}
        processId={processId}
        relationId={relationId}
        selectNodeId={selectNodeId}
        type={2}
        height={0}
        content={selectMsg}
        formulaMap={data.formulaMap}
        onChange={(err, value, obj) => setMsg(value)}
        updateSource={updateSource}
      />
      <div className="mTop20">{_l('预览')}</div>
      <Preview className="flexRow mTop15">
        <div className="circle chat_workflow" />
        <div className="mLeft15 flex">
          <div className="mTop6">
            <span className="Gray_75">{_l('工作流')}：</span>
            <span>
              【{data.name}】{_l('{记录名称}：{记录标题}，')}
            </span>
            {!selectMsg.trim() && selectMsgKey === 'passMessage' && _l('已通过审批')}
            {!selectMsg.trim() && selectMsgKey === 'overruleMessage' && _l('已否决审批')}
            {selectMsg.trim() && <span style={{ background: '#FFA340' }}>{getNodeText(selectMsg)}</span>}
            <span className="ThemeColor3 mLeft5">{_l('查看详情')}</span>
          </div>
          <div className="mTop15 Gray_75">{moment().format('YYYY-MM-DD HH:mm:ss')}</div>
        </div>
      </Preview>
    </Dialog>
  );
};
