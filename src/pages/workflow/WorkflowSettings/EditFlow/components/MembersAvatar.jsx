import React from 'react';
import cx from 'classnames';
import { USER_TYPE, NODE_TYPE } from '../../enum';

export default ({ accounts, type }) => {
  if (!accounts.length) {
    return <i className={cx('workflowAvatar BGGray', type === NODE_TYPE.APPROVAL ? 'icon-workflow_ea' : 'icon-charger')} />;
  }

  const classNames = cx('workflowAvatar', { workflowAvatarSmall: accounts.length > 1 });
  const list = accounts.slice(0, 6).map((obj, i) => {
    if (obj.type === USER_TYPE.USER) {
      return <img key={i} className={classNames} src={obj.avatar} />;
    } else if (obj.type === USER_TYPE.ROLE) {
      return (
        <i
          key={i}
          className={cx(
            classNames,
            'icon-invite_members',
            { BGViolet: type === NODE_TYPE.APPROVAL },
            { BGBlue: type === NODE_TYPE.NOTICE },
            { BGSkyBlue: type === NODE_TYPE.WRITE }
          )}
        />
      );
    }

    return <i key={i} className={cx(classNames, 'BGGreen icon-charger')} />;
  });

  if (accounts.length > 6) {
    list.push(
      <span key={6} className={cx('workflowAvatarMore', classNames)}>
        <i className="icon-task-point-more Font14" />
      </span>
    );
  }

  return list;
};
