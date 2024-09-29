import React from 'react';
import { Icon } from 'ming-ui';
import DropMotion from 'worksheet/components/Animations/DropMotion';
import './index.less';

export default function WorksheetDraftOperate(props) {
  const { selected = [], onCancel = () => {}, deleteSelete = () => {} } = props;

  return (
    <DropMotion
      duration={200}
      style={{ marginLeft: -10, marginRight: -20, position: 'absolute', width: '100%', top: 0, zIndex: 2 }}
      visible={!!selected.length}
    >
      <div className="draftOperateCon">
        <span className="Font16 mRight24">{_l('已选择%0条草稿', selected.length)}</span>
        <div className="del InlineBlock Hand" onClick={() => deleteSelete(selected)}>
          <Icon icon="delete2" className="mRight6" />
          {_l('删除')}
        </div>
        <span className="close Right">
          <Icon icon="close" className="Hand" onClick={onCancel} />
        </span>
      </div>
    </DropMotion>
  );
}
