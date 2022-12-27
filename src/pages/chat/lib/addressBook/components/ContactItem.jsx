import React from 'react';
import cx from 'classnames';

import { LazyloadImg } from 'src/pages/feed/components/common/img';
import _ from 'lodash';

export default function ContactItem(props) {
  const {
    avatar,
    fullname,
    accountId,
    isSelected,
    isFriend,
    isContact,
    itemClickHandler,
    searchDepartmentUsers,
    departments = [],
  } = props;
  const cls = cx('list-item Hand Font13', { ThemeBGColor6: isSelected });
  let departmentName = (!_.isEmpty(departments) && departments[departments.length - 1]) || '';
  return (
    <div
      className={cls}
      onClick={() => {
        itemClickHandler({
          accountId,
          isFriend,
          isContact,
        });
      }}
    >
      <LazyloadImg src={avatar} placeholder={'/images/blank.gif'} className="list-item-avatar" />
      <span className="list-item-name" title={fullname}>
        {fullname}
      </span>
      {searchDepartmentUsers && <span className="list-item-department">{departmentName}</span>}
    </div>
  );
}
