import React from 'react';
import { Checkbox } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';

const isChecked = (id, ids) => {
  let result = false;
  for (let i = 0; i < ids.length; i++) {
    if (ids[i] === id) {
      result = true;
      break;
    }
  }
  return result;
};

export default function UserItem({
  renderKey,
  renderItemType,
  item,
  onlyOne,
  filterAccountIds = [],
  selectedUsers = [],
  selectedAccount = () => {},
  selectedDepartment = () => {},
  handleSelectSubDepartment = () => {},
}) {
  if (renderItemType === 'user') {
    let { departmentName } = _.get(item, 'departmentInfo') || {};
    // 指定人员时，部门字段取department
    if (item.department) departmentName = item.department;
    let { job } = item;
    let avatar = item.avatar || 'https://dn-mdpic.mingdao.com/UserAvatar/undefined.gif?imageView2/1/w/100/h/100/q/90';

    return (
      <div key={renderKey} className="checkItemBox" onClick={() => selectedAccount(item)}>
        {!onlyOne && (
          <div className="checkboxBox" onMouseDown={event => event.preventDefault()}>
            <Checkbox
              style={{ '--icon-size': '18px' }}
              checked={isChecked(
                item.accountId,
                selectedUsers.map(item => item.accountId),
              )}
              onClick={() => selectedAccount(item)}
            />
          </div>
        )}
        <div className="checkItemInfoBox" onMouseDown={event => event.preventDefault()}>
          <img src={avatar} className="avatar" />
          <div className="useInfoBox">
            <div className={cx('fullname ellipsis', { bold: renderKey === 'prefix' })}>
              {renderKey === 'prefix' &&
              !filterAccountIds.includes(md.global.Account.accountId) &&
              item.accountId === md.global.Account.accountId
                ? _l('我自己')
                : item.fullname}
            </div>
            <div className="departmentInfo ellipsis">
              {departmentName && job ? `${departmentName} / ${job}` : departmentName || job}
            </div>
          </div>
        </div>
      </div>
    );
  } else if (renderItemType === 'department') {
    return (
      <div key={renderKey} className="departmentItemBox">
        {!onlyOne && (
          <div className="checkboxBox" onMouseDown={event => event.preventDefault()}>
            <Checkbox
              style={{ '--icon-size': '18px' }}
              checked={
                item.disabledSubDepartment ||
                isChecked(
                  item.departmentId,
                  selectedUsers.map(item => item.departmentId),
                )
              }
              disabled={item.disabledSubDepartment || item.disabled}
              onClick={() => selectedDepartment(item)}
            />
          </div>
        )}
        <div className="departmentSelectItemInfoBox" onMouseDown={event => event.preventDefault()}>
          <div className="departmentItemContent" onClick={() => selectedDepartment(item)}>
            <div className="groupWrapper">
              <Icon icon="group" className="Font22 White" />
            </div>
            <div className="departmentName">{item.departmentName}</div>
          </div>
          {item.haveSubDepartment && (
            <div className="extraDivision" onClick={() => handleSelectSubDepartment(item)}>
              <Icon icon="arrow-right-border" className="Font18 Gray_bd" />
            </div>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div key={item.departmentId} className="departmentItemBox" onClick={selectedDepartment}>
        <div className="departmentSelectItemInfoBox" onMouseDown={event => event.preventDefault()}>
          <div className="departmentItemContent">
            <div className="groupWrapper">
              <Icon icon="group" className="Font22 White" />
            </div>
            <div className="departmentName">{item.departmentName}</div>
          </div>
          <Icon icon="arrow-right-border" className="Font18 Gray_bd" />
        </div>
      </div>
    );
  }
}
