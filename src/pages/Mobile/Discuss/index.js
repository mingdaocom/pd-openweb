import React, { Fragment, Component } from 'react';
import DiscussInfo from './DiscussInfo';
import cx from 'classnames';
import { Popup } from 'antd-mobile';
import _ from 'lodash';

export default props => {
  const { isModal, match, appId, worksheetId, rowId, viewId, projectId, discussionCount } = props;
  const { className, visible, onClose, onAddCount = _.noop, originalData } = props;
  if (isModal) {
    if (!visible) return null;

    return (
      <Popup className={cx('mobileModal full', className)} onClose={onClose} visible={visible}>
        {rowId && (
          <DiscussInfo
            isModal={true}
            match={{ params: { appId, worksheetId, rowId, viewId } }}
            onClose={onClose}
            onAddCount={onAddCount}
            originalData={originalData}
            projectId={projectId}
            discussionCount={discussionCount}
          />
        )}
      </Popup>
    );
  } else {
    return <DiscussInfo match={match} isModal={false} onAddCount={onAddCount} />;
  }
};
