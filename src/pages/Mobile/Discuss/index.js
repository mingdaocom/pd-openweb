import React from 'react';
import { Popup } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import DiscussInfo from './DiscussInfo';

export default props => {
  const { isModal, match, appId, worksheetId, rowId, viewId, projectId, discussionCount, getDiscussionsCount } = props;
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
            getDiscussionsCount={getDiscussionsCount}
            {...props}
          />
        )}
      </Popup>
    );
  } else {
    return <DiscussInfo match={match} isModal={false} onAddCount={onAddCount} {...props} />;
  }
};
