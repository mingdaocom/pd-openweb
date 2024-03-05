import React from 'react';
import { Icon } from 'ming-ui';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import './index.less';

export default function WorksheetDraftOperate(props) {
  const { selected = [], onCancel = () => {}, deleteSelete = () => {} } = props;

  return (
    <ReactCSSTransitionGroup transitionName="draftOperateCon" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
      {!!selected.length && (
        <div className="draftOperateCon">
          <span className="Font16 mRight24">{_l('已选择%0条草稿', selected.length)}</span>
          <div className="del InlineBlock" onClick={() => deleteSelete(selected)}>
            <Icon icon="delete2" className="mRight6" />
            {_l('删除')}
          </div>
          <span className="close Right">
            <Icon icon="close" className="Hand" onClick={onCancel} />
          </span>
        </div>
      )}
    </ReactCSSTransitionGroup>
  );
}
