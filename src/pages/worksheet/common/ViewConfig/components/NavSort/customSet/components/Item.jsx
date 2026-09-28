import React, { useEffect, useRef } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, UserHead } from 'ming-ui';
import { DeptSelectPopover } from 'ming-ui/functions/quickSelectDept';
import { RoleSelectPopover } from 'ming-ui/functions/quickSelectRole';
import { UserSelectPopover } from 'ming-ui/functions/quickSelectUser';
import { isSameType } from 'src/pages/worksheet/common/ViewConfig/util.js';
import { getTabTypeBySelectUser } from 'src/utils/domain/control/controlSelection';
import DropCon from './DropCon';
import Option from './Options';
import './index.less';

export default function (props) {
  const { setting } = props;
  const valueRef = useRef();

  useEffect(() => {
    valueRef.current = setting;
  }, [setting]);

  const { onDelete, item, onUpdate, projectId, appId, DragHandle, maxCount } = props;
  const { num, info } = item;

  const onSaveAddUser = (data, isCancel = false) => {
    if (isCancel) {
      data[0] && onDelete(data[0]);
      return;
    }

    onUpdate(data, num);
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

  //添加角色
  const onSaveAddRole = (data, isCancel = false) => {
    if (!data.length) return;
    const newData = isCancel
      ? valueRef.current.filter(l => l.organizeId !== data[0].organizeId)
      : _.uniqBy(valueRef.current.concat(data), 'organizeId');
    onUpdate(maxCount ? newData.slice(0, maxCount) : newData, num);
  };

  const isAddDisabled = setting.length >= 50;
  const addIcon = (
    <Icon
      className={cx(
        'Font16 addNext mLeft15 textTertiary TxtCenter',
        isAddDisabled ? 'disabled' : 'Hand hoverColorPrimary',
      )}
      icon="add"
    />
  );

  return (
    <div className="flexRow customsortItem alignItemsCenter">
      <span className={cx('con flexRow flex alignItemsCenter pLeft6 pRight6')}>
        <DragHandle className="alignItemsCenter flexRow">
          <Icon className="mRight10 Font16 textTertiary hoverColorPrimary Hand dragHandle" icon="drag" />
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
          icon="trash"
          onClick={() => {
            onDelete(info);
          }}
        />
      </span>
      {isSameType([26], props.controlInfo) && !isAddDisabled ? (
        <UserSelectPopover
          showMoreInvite={false}
          tabType={getTabTypeBySelectUser(props.controlInfo)}
          appId={appId}
          includeUndefinedAndMySelf={false}
          includeSystemField={false}
          offset={{ top: 4, left: 0 }}
          isDynamic
          filterAccountIds={['user-self']}
          selectedAccountIds={setting.map(l => l.accountId)}
          SelectUserSettings={{
            projectId,
            unique: false,
            filterResigned: false,
            callback: onSaveAddUser,
          }}
          onSelect={onSaveAddUser}
        >
          {addIcon}
        </UserSelectPopover>
      ) : isSameType([27], props.controlInfo) && !isAddDisabled ? (
        <DeptSelectPopover
          projectId={projectId}
          isIncludeRoot={false}
          unique={false}
          showCreateBtn={false}
          selectedDepartment={setting}
          selectFn={onSaveAddDep}
        >
          {addIcon}
        </DeptSelectPopover>
      ) : isSameType([48], props.controlInfo) && !isAddDisabled ? (
        <RoleSelectPopover
          projectId={projectId}
          unique={false}
          value={setting}
          onSave={onSaveAddRole}
          placement="bottomLeft"
        >
          {addIcon}
        </RoleSelectPopover>
      ) : !isAddDisabled ? (
        <DropCon
          controlInfo={props.controlInfo}
          currentList={setting}
          onChange={(item, insertOffset) => onUpdate(item, num + insertOffset)}
          onDelete={onDelete}
        >
          {addIcon}
        </DropCon>
      ) : (
        addIcon
      )}
    </div>
  );
}
