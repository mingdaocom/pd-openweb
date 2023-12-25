import React, { useState } from 'react';
import Member from '../Member';
import SelectUserDropDown from '../SelectUserDropDown';

export default props => {
  const [visible, setVisible] = useState(false);
  const { operationUserRange, operationType, title, btnText, updateSource } = props;
  const accounts = (operationUserRange || {})[operationType] || [];

  return (
    <div className="mLeft25 relative">
      <div className="Font13 mTop10 Gray_9e">
        {title}
        {accounts.length ? _l('以下指定成员') : _l('所有成员')}
      </div>
      <Member companyId={props.companyId} accounts={accounts} updateSource={updateSource} />
      <div className="mTop12 flexRow ThemeColor3 workflowDetailAddBtn" onClick={() => setVisible(true)}>
        <i className="Font28 icon-task-add-member-circle mRight10" />
        {btnText}
        <SelectUserDropDown
          appId={props.relationType === 2 ? props.relationId : ''}
          visible={visible}
          companyId={props.companyId}
          processId={props.processId}
          nodeId={props.selectNodeId}
          accounts={accounts}
          updateSource={updateSource}
          onClose={() => setVisible(false)}
        />
      </div>
    </div>
  );
};
