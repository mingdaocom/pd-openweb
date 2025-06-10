import React, { useEffect, useRef } from 'react';
import cx from 'classnames';
import { Icon, UserHead } from 'ming-ui';
import { quickSelectDept, quickSelectRole, quickSelectUser } from 'ming-ui/functions';
import { isSameType } from 'src/pages/worksheet/common/ViewConfig/util.js';
import { getTabTypeBySelectUser } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import DropCon from './DropCon';
import Option from './Options';
import './index.less';

export default function (props) {
  const { setting } = props;
  const $ref = useRef(null);
  const valueRef = useRef();

  useEffect(() => {
    valueRef.current = setting;
  }, [setting]);

  const { onAdd, onDelete, item, onUpdate, projectId, appId, DragHandle } = props;
  const { num, info } = item;
  const addUser = (isMultiple = true, tabType, cb) => {
    quickSelectUser($ref.current, {
      showMoreInvite: false,
      isTask: false,
      tabType,
      appId,
      includeUndefinedAndMySelf: false,
      includeSystemField: false,
      offset: {
        top: 4,
        left: 68,
      },
      zIndex: 10001,
      isDynamic: true,
      filterAccountIds: [md.global.Account.accountId, 'user-self'],
      selectedAccountIds: valueRef.current.map(l => l.accountId),
      SelectUserSettings: {
        projectId,
        unique: !isMultiple,
        filterResigned: false,
        callback(users) {
          cb(users);
        },
      },
      selectCb(users) {
        cb(users);
      },
    });
  };
  const onSaveAddDep = (data, isCancel = false) => {
    const lastIds = _.sortedUniq(valueRef.current.map(l => l.departmentId));
    const newIds = _.sortedUniq(data.map(l => l.departmentId));
    if ((data.length === 0 || _.isEqual(lastIds, newIds)) && !isCancel) return;
    const newData = isCancel
      ? valueRef.current.filter(l => l.departmentId !== data[0].departmentId)
      : _.uniqBy(valueRef.current.concat(data), 'departmentId');
    onUpdate(maxCount ? newData.slice(0, maxCount) : newData, num);
  };

  const addDep = (e, isMultiple = true, cb) => {
    quickSelectDept(e.target, {
      projectId,
      isIncludeRoot: false,
      unique: !isMultiple,
      showCreateBtn: false,
      selectedDepartment: valueRef.current,
      selectFn: onSaveAddDep,
    });
  };

  //添加角色
  const addRole = e => {
    quickSelectRole(e.target, {
      projectId,
      unique: false,
      offset: {
        left: -167,
      },
      value: setting,
      onSave: (data, isCancel = false) => {
        if (!data.length) return;
        const newData = isCancel
          ? valueRef.current.filter(l => l.organizeId !== data[0].organizeId)
          : _.uniqBy(valueRef.current.concat(data), 'organizeId');
        onUpdate(maxCount ? newData.slice(0, maxCount) : newData, num);
      },
    });
  };

  if (info === 'add') {
    return <DropCon {...props} currentList={setting} onChange={item => onUpdate(item)} />;
  }

  return (
    <div className="flexRow customsortItem alignItemsCenter" ref={$ref}>
      <span className={cx('con flexRow flex alignItemsCenter pLeft6 pRight6')}>
        <DragHandle className="alignItemsCenter flexRow">
          <Icon className="mRight10 Font16 Gray_9e ThemeHoverColor3 Hand dragHandle" icon="drag" />
        </DragHandle>
        {isSameType([9, 10, 11], props.controlInfo) && (
          <span className="flex WordBreak overflow_ellipsis">
            <Option controlInfo={props.controlInfo} item={info} />
          </span>
        )}
        {isSameType([28], props.controlInfo) && <span className="flex">{_l('%0 级', parseInt(info, 10))}</span>}
        {isSameType([29], props.controlInfo) && (
          <span className="overflow_ellipsis Font13 WordBreak flex">{(info || {}).name || _l('未命名')}</span>
        )}
        {isSameType([27, 48], props.controlInfo) && (
          <span className="overflow_ellipsis Font13 WordBreak flex">
            {(info || {})[isSameType([27], props.controlInfo) ? 'departmentName' : 'organizeName'] || _l('未命名')}
          </span>
        )}
        {isSameType([26], props.controlInfo) && (
          <span className="flexRow flex">
            <UserHead
              user={{
                userHead: info.avatar,
                accountId: info.accountId,
              }}
              appId={appId}
              projectId={projectId}
              size={28}
            />
            <span className="overflow_ellipsis Font13 WordBreak flex mLeft10">
              {(info || {}).fullname || _l('未命名')}
            </span>
          </span>
        )}
        <Icon
          className="Font16 Hand delete mLeft15 deleteLine"
          icon="delete2"
          onClick={() => {
            onDelete(info);
          }}
        />
      </span>
      <Icon
        className={cx(
          'Font16 addNext mLeft15 Gray_9e TxtCenter',
          setting.length >= 50 ? 'disabled' : 'Hand ThemeHoverColor3',
        )}
        icon="add"
        onClick={e => {
          if (setting.length >= 50) {
            return;
          }
          if (isSameType([26], props.controlInfo)) {
            addUser(true, getTabTypeBySelectUser(props.controlInfo), users => {
              onUpdate(users, num);
            });
          } else if (isSameType([27], props.controlInfo)) {
            addDep(e, true);
          } else if (isSameType([48], props.controlInfo)) {
            addRole(e, true);
          } else {
            onAdd(num);
          }
        }}
      />
    </div>
  );
}
